import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPracticeChallenge, getPracticeMetrics } from '../../js/practice/challenges.js';
import { startPracticeTimer, checkWinCondition } from '../../js/ui/event-handlers.js';
import { initializeDOMReferences, renderEditor, updateChallengeUI, updateInstructions } from '../../js/ui/ui-components.js';
import * as state from '../../js/core/game-state.js';
import { t } from '../../js/utils/i18n.js';
import { readSessionLocation } from '../../js/storage/session-location.js';

describe('practice tasks and session end', () => {
    beforeEach(() => {
        localStorage.clear();
        state.resetGameState();
        state.resetChallengeState();
        state.setChallengeMode(true);
        document.body.innerHTML = '<div id="editor-workspace"><div id="vim-editor-display"></div><div id="target-pane"><div id="vim-target-display" aria-readonly="true"></div></div></div><div id="instructions"></div><span id="session-command"></span><div id="practice-score-wrap"><span id="challenge-score"></span></div>';
        initializeDOMReferences();
    });

    afterEach(() => {
        state.resetChallengeState();
        state.setChallengeMode(false);
        vi.useRealTimers();
    });

    it('shows read-only targets and differences without command hints in timed practice', async () => {
        const challenge = createPracticeChallenge({ mode: 'time', duration: 30 });
        state.setCurrentChallenge(challenge);
        for (let index = 0; index < 6; index++) {
            const task = challenge.tasks[index];
            state.setCurrentTaskIndex(index);
            expect(task.initialCursor).toEqual({ row: 0, col: 0 });
            expect(task.highlights.length).toBeGreaterThan(0);
            renderEditor(task.initialContent, task.initialCursor, 'NORMAL');
            expect(document.querySelector('.diff-removed')).not.toBeNull();
            expect(document.querySelector('.diff-added')).not.toBeNull();
            expect(document.getElementById('editor-workspace').classList.contains('golf-split')).toBe(true);
            expect(document.getElementById('target-pane').classList.contains('hidden')).toBe(false);
            const target = document.getElementById('vim-target-display');
            expect([...target.querySelectorAll('.editor-line:not(.diff-placeholder) > .flex-1')].map(line => line.textContent === '\u00a0' ? '' : line.textContent)).toEqual(task.targetContent);
            expect(target.getAttribute('aria-readonly')).toBe('true');
            expect(target.querySelector('.cursor')).toBeNull();
            updateInstructions();
            await vi.waitFor(() => expect(document.getElementById('instructions').textContent).toContain(t('matchTarget')));
            expect(document.querySelector('.vim-hint')).toBeNull();
            expect(task.instruction).not.toMatch(/\bwith dd\b|\bwith dw\b|ci"/);
        }
    });

    it('updates both panes when a timed task is completed', () => {
        const challenge = createPracticeChallenge({ mode: 'time', duration: 30 });
        state.setCurrentChallenge(challenge);
        state.setCurrentTaskIndex(0);
        state.setContent(challenge.tasks[0].targetContent);
        checkWinCondition();
        expect(state.getCurrentTaskIndex()).toBe(1);
        expect(state.getContent()).toEqual(challenge.tasks[1].initialContent);
        expect(document.getElementById('target-pane').classList.contains('hidden')).toBe(false);
        const targetLines = [...document.querySelectorAll('#vim-target-display .editor-line:not(.diff-placeholder) > .flex-1')]
            .map(line => line.textContent === '\u00a0' ? '' : line.textContent);
        expect(targetLines).toEqual(challenge.tasks[1].targetContent);
    });

    it('counts the final completed task', () => {
        const challenge = createPracticeChallenge({ mode: 'time', duration: 30 });
        const lastIndex = challenge.tasks.length - 1;
        state.setCurrentChallenge(challenge);
        state.setCurrentTaskIndex(lastIndex);
        state.setChallengeProgressValue(lastIndex);
        state.setContent(challenge.tasks[lastIndex].targetContent);

        checkWinCondition();

        expect(state.getCurrentChallenge().finished).toBe(true);
        expect(state.getChallengeProgressValue()).toBe(challenge.tasks.length);
        expect(readSessionLocation().time).toMatchObject({
            finished: true,
            progress: challenge.tasks.length,
            score: state.getChallengeScoreValue()
        });
    });

    it('renders the current timed-practice score', () => {
        const challenge = createPracticeChallenge({ mode: 'time', duration: 30 });
        updateChallengeUI(challenge, 2, 37, 20);
        expect(document.getElementById('challenge-score').textContent).toBe('37');
        expect(document.getElementById('practice-score-wrap').classList.contains('hidden')).toBe(false);
    });

    it('resets the score shown for a new practice session', async () => {
        const { startChallenge } = await import('../../js/practice/challenges.js');
        const gameState = {
            currentChallenge: null,
            resetLevelState: state.resetLevelState,
            setContent: state.setContent,
            setCursor: state.setCursor,
            setMode: state.setMode,
            setCurrentChallenge: state.setCurrentChallenge,
            setCurrentTaskIndex: state.setCurrentTaskIndex,
            setChallengeScoreValue: state.setChallengeScoreValue,
            setChallengeProgressValue: state.setChallengeProgressValue,
            setChallengeStartTime: state.setChallengeStartTime
        };

        startChallenge(gameState, { mode: 'time', duration: 30 });

        expect(state.getChallengeScoreValue()).toBe(0);
    });

    it('rejects a completed task after the deadline before the interval fires', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
        const challenge = createPracticeChallenge({ mode: 'time', duration: 30 });
        state.setCurrentChallenge(challenge);
        startPracticeTimer();
        state.setContent(challenge.tasks[0].targetContent);
        vi.setSystemTime(new Date('2026-01-01T00:00:30Z'));

        checkWinCondition();

        expect(state.getChallengeScoreValue()).toBe(0);
        expect(state.getCurrentTaskIndex()).toBe(0);
        expect(state.getChallengeProgressValue()).toBe(0);
        expect(state.getCurrentChallenge().finished).toBe(true);
        expect(state.getChallengeTimerInterval()).toBeNull();
        expect(readSessionLocation().time.finished).toBe(true);
    });

    it('blocks keyboard commands and metrics after the deadline before the interval fires', async () => {
        const { setupEventListeners } = await import('../../js/main.js');
        document.body.insertAdjacentHTML('beforeend', '<textarea id="vim-editor-input"></textarea>');
        setupEventListeners();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
        const challenge = createPracticeChallenge({ mode: 'time', duration: 30 });
        state.setCurrentChallenge(challenge);
        state.setContent(['keep this line']);
        startPracticeTimer();
        const metrics = getPracticeMetrics();
        vi.setSystemTime(new Date('2026-01-01T00:00:30Z'));
        const event = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });

        document.getElementById('vim-editor-input').dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(state.getContent()).toEqual(['keep this line']);
        expect(getPracticeMetrics()).toEqual(metrics);
        expect(state.getCurrentChallenge().finished).toBe(true);
        expect(state.getChallengeTimerInterval()).toBeNull();
        expect(readSessionLocation().time.finished).toBe(true);
    });

    it('keeps the practice screen and buffer after time expires', () => {
        vi.useFakeTimers();
        const challenge = createPracticeChallenge({ mode: 'time', duration: 30 });
        state.setCurrentChallenge(challenge);
        state.setContent(challenge.tasks[0].initialContent);
        expect(startPracticeTimer()).toBe(true);
        vi.advanceTimersByTime(30_000);
        expect(state.getChallengeMode()).toBe(true);
        expect(state.getCurrentChallenge().finished).toBe(true);
        expect(state.getContent()).toEqual(challenge.tasks[0].initialContent);
        expect(document.getElementById('session-command').textContent).toBe('./practice');
        expect(startPracticeTimer()).toBe(false);
        state.setContent(challenge.tasks[0].targetContent);
        checkWinCondition();
        expect(state.getCurrentTaskIndex()).toBe(0);
        expect(state.getChallengeScoreValue()).toBe(0);
    });
});
