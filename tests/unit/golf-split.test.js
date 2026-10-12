import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPracticeChallenge, loadChallengeTask, recordPracticeKey, getPracticeMetrics } from '../../js/practice/challenges.js';
import { restartPracticeSession } from '../../js/ui/event-handlers.js';
import { initializeDOMReferences, renderEditor, updateInstructions, updateChallengeUI } from '../../js/ui/ui-components.js';
import { t } from '../../js/utils/i18n.js';
import * as state from '../../js/core/game-state.js';
import { replay } from '../golden/replay.js';

describe('golf side-by-side editors', () => {
    beforeEach(() => {
        const page = readFileSync('index.html', 'utf8');
        document.body.innerHTML = page.match(/<body[^>]*>([\s\S]*)<\/body>/)[1]
            .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
        state.resetGameState();
        state.resetChallengeState();
        state.setChallengeMode(true);
        initializeDOMReferences();
    });

    it('places the only input in the left pane and renders a read-only target', () => {
        const challenge = createPracticeChallenge({ mode: 'golf' });
        state.setCurrentChallenge(challenge);
        state.setCurrentTaskIndex(0);
        loadChallengeTask(challenge.tasks[0], state);
        renderEditor(state.getContent(), state.getCursor(), state.getMode());
        expect(document.getElementById('editor-workspace').classList.contains('golf-split')).toBe(true);
        expect(document.getElementById('editable-pane').contains(document.getElementById('vim-editor-input'))).toBe(true);
        const target = document.getElementById('vim-target-display');
        expect(target.getAttribute('aria-readonly')).toBe('true');
        expect(document.querySelector('#target-pane textarea, #target-pane input, #target-pane [contenteditable="true"]')).toBeNull();
        expect(target.querySelector('.cursor')).toBeNull();
        const targetLines = () => [...target.querySelectorAll('.editor-line:not(.diff-placeholder) > .flex-1')].map(line => line.textContent);
        expect(targetLines())
            .toEqual(challenge.tasks[0].targetContent);
        const before = targetLines();
        replay(['j', 'A', '!', 'Escape']);
        renderEditor(state.getContent(), state.getCursor(), state.getMode());
        expect(targetLines()).toEqual(before);
        expect(state.getContent()).not.toEqual(challenge.tasks[0].initialContent);
    });

    it('updates the target between puzzles and displays HTML as text', async () => {
        const challenge = createPracticeChallenge({ mode: 'golf' });
        state.setCurrentChallenge(challenge);
        const index = challenge.tasks.findIndex(task => task.format === 'html');
        state.setCurrentTaskIndex(index);
        loadChallengeTask(challenge.tasks[index], state);
        renderEditor(state.getContent(), state.getCursor(), state.getMode());
        const target = document.getElementById('vim-target-display');
        expect(target.textContent).toContain('<footer>Free to try</footer>');
        expect(target.querySelector('footer')).toBeNull();
        updateInstructions();
        await vi.waitFor(() => expect(document.getElementById('instructions').textContent).toContain(t('matchTarget')));
        expect(document.querySelector('.practice-target')).toBeNull();
    });

    it('uses split editors for both practice modes and a single editor for training', () => {
        for (const mode of ['golf', 'time', 'train']) {
            state.setChallengeMode(mode !== 'train');
            const challenge = createPracticeChallenge({ mode: mode === 'train' ? 'time' : mode });
            state.setCurrentChallenge(challenge);
            state.setCurrentTaskIndex(0);
            loadChallengeTask(challenge.tasks[0], state);
            renderEditor(state.getContent(), state.getCursor(), state.getMode());
            expect(document.getElementById('target-pane').classList.contains('hidden')).toBe(mode === 'train');
            expect(document.getElementById('editor-workspace').classList.contains('golf-split')).toBe(mode !== 'train');
        }
        expect(document.getElementById('vim-target-display').innerHTML).toBe('');
    });

    it('highlights differences and aligns unchanged lines without cascading highlights', () => {
        state.setCurrentChallenge({ mode: 'golf', tasks: [{ targetContent: ['keep', 'new value', 'end'] }] });
        state.setCurrentTaskIndex(0);
        renderEditor(['keep', 'old value', 'extra', 'end'], { row: 3, col: 0 }, 'NORMAL');
        const left = document.getElementById('vim-editor-display');
        const right = document.getElementById('vim-target-display');
        expect(left.querySelectorAll('.diff-removed')).toHaveLength(2);
        expect(right.querySelectorAll('.diff-added')).toHaveLength(1);
        expect(right.querySelectorAll('.diff-placeholder')).toHaveLength(1);
        expect(left.querySelector('.cursor').textContent).toBe('e');
        expect([...left.querySelectorAll('.editor-line')].at(-1).classList.contains('diff-removed')).toBe(false);
        expect([...right.querySelectorAll('.editor-line')].at(-1).classList.contains('diff-added')).toBe(false);
        renderEditor(['keep', 'new value', 'end'], { row: 0, col: 0 }, 'NORMAL');
        expect(document.querySelector('.diff-added, .diff-removed, .diff-placeholder')).toBeNull();
    });

    it('shows only completed tasks for timed practice and restores the total for golf', () => {
        const timed = createPracticeChallenge({ mode: 'time', duration: 300 });
        updateChallengeUI(timed, 7, 70, 200);
        expect(document.getElementById('challenge-progress').textContent).toBe('7');
        expect(document.getElementById('time-completed-label').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('challenge-total-wrap').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('golf-completed-label').classList.contains('hidden')).toBe(true);
        const golf = createPracticeChallenge({ mode: 'golf' });
        updateChallengeUI(golf, 0, 0, 0);
        expect(document.getElementById('challenge-total-wrap').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('challenge-total').textContent).toBe('8');
        expect(document.getElementById('time-completed-label').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('golf-completed-label').classList.contains('hidden')).toBe(false);
    });

    it('restarts the selected puzzle instead of returning to the first', () => {
        const challenge = createPracticeChallenge({ mode: 'golf' });
        state.setCurrentChallenge({ ...challenge, golfAttemptComplete: true });
        state.setCurrentTaskIndex(4);
        state.setContent(['changed buffer']);
        recordPracticeKey({ key: 'j' });
        restartPracticeSession();
        expect(state.getCurrentTaskIndex()).toBe(4);
        expect(state.getContent()).toEqual(challenge.tasks[4].initialContent);
        expect(state.getCursor()).toEqual({ row: 0, col: 0 });
        expect(state.getCurrentChallenge().golfAttemptComplete).toBe(false);
        expect(getPracticeMetrics().keystrokes).toBe(0);
    });
});
