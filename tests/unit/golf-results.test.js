import { beforeEach, describe, expect, it } from 'vitest';
import { createPracticeChallenge, resetPracticeMetrics, recordPracticeKey, getGolfResult, getPracticeMetrics, loadChallengeTask, calculateTaskPoints } from '../../js/practice/challenges.js';
import { checkWinCondition, selectGolfTask } from '../../js/ui/event-handlers.js';
import { initializeDOMReferences, updateChallengeUI } from '../../js/ui/ui-components.js';
import * as state from '../../js/core/game-state.js';
import { replay } from '../golden/replay.js';

describe('fixed golf puzzles and saved keystrokes', () => {
    let challenge;

    beforeEach(() => {
        localStorage.clear();
        state.resetGameState();
        state.resetChallengeState();
        state.setChallengeMode(true);
        resetPracticeMetrics();
        challenge = createPracticeChallenge({ mode: 'golf' });
        state.setCurrentChallenge(challenge);
        state.setCurrentTaskIndex(0);
        document.body.innerHTML = '<div id="golf-results"><span id="golf-current"></span><span id="golf-last"></span><span id="golf-best"></span><div id="golf-task-list"></div></div><div id="practice-score-wrap"></div>';
        initializeDOMReferences();
        loadChallengeTask(challenge.tasks[0], state);
    });

    const solve = keys => {
        for (const key of keys) {
            recordPracticeKey({ key });
            replay([key]);
            checkWinCondition();
        }
    };

    it('verifies every fixed puzzle solution from its declared start', () => {
        expect(challenge.tasks).toHaveLength(8);
        expect(new Set(challenge.tasks.map(task => task.id)).size).toBe(8);
        expect(new Set(challenge.tasks.map(task => task.format)).size).toBe(8);
        expect(challenge.tasks.filter(task => task.format === 'javascript')).toHaveLength(1);
        expect(challenge.tasks.map(task => task.id)).not.toContain('golf-client-v2');
        expect(challenge.tasks.map(task => task.id)).not.toContain('golf-environment-v1');
        for (const task of challenge.tasks) {
            expect(task.highlights.length, task.id).toBeGreaterThanOrEqual(3);
            state.resetGameState();
            loadChallengeTask(task, state);
            replay(task.solution);
            expect(state.getContent(), task.id).toEqual(task.targetContent);
            expect(task.validation(state), task.id).toBe(true);
        }
    });

    it('renders all eight puzzles and saves each completed attempt independently', () => {
        updateChallengeUI(challenge, 0, 0, 0, getPracticeMetrics());
        expect(document.querySelectorAll('[data-golf-task]')).toHaveLength(8);
        for (let index = 0; index < challenge.tasks.length; index++) {
            selectGolfTask(index);
            const task = challenge.tasks[index];
            solve(task.solution);
            expect(getGolfResult(task.id), task.id).toMatchObject({
                last: task.solution.length, best: task.solution.length, attempts: 1
            });
            expect(state.getChallengeProgressValue()).toBe(index + 1);
        }
    });

    it('does not reuse records from the previous simple puzzles', () => {
        localStorage.setItem('vimcatch-golf-results-v1', JSON.stringify({
            'golf-remove-debug-v1': { last: 4, best: 4, attempts: 1 }
        }));
        selectGolfTask(0);
        expect(getGolfResult(challenge.tasks[0].id)).toBeNull();
        expect(document.getElementById('golf-best').textContent).toBe('—');
    });

    it('saves last and best results independently and keeps the solved puzzle visible', () => {
        const task = challenge.tasks[0];
        const baseline = task.solution.length;
        solve(['j', 'k', ...task.solution]);
        expect(getGolfResult(task.id)).toMatchObject({ last: baseline + 2, best: baseline + 2, attempts: 1 });
        expect(state.getCurrentTaskIndex()).toBe(0);
        expect(state.getCurrentChallenge().golfAttemptComplete).toBe(true);
        selectGolfTask(0);
        expect(getPracticeMetrics().keystrokes).toBe(0);
        expect(document.getElementById('golf-best').textContent).toContain(String(baseline + 2));
        solve(task.solution);
        expect(getGolfResult(task.id)).toMatchObject({ last: baseline, best: baseline, attempts: 2 });
        selectGolfTask(0);
        solve(['j', 'k', ...task.solution]);
        expect(getGolfResult(task.id)).toMatchObject({ last: baseline + 2, best: baseline, attempts: 3 });
        expect(JSON.parse(localStorage.getItem('vimcatch-golf-results-v1'))[task.id]).toMatchObject({ last: baseline + 2, best: baseline });
        expect(getGolfResult(challenge.tasks[1].id)).toBeNull();
        expect(calculateTaskPoints(challenge, 0)).toBe(0);
        const restarted = createPracticeChallenge({ mode: 'golf' });
        state.setCurrentChallenge(restarted);
        state.setCurrentTaskIndex(0);
        updateChallengeUI(restarted, 0, 0, 0, getPracticeMetrics());
        expect(document.getElementById('golf-best').textContent).toContain(String(baseline));
        expect(document.getElementById('practice-score-wrap').classList.contains('hidden')).toBe(true);
    });

    it('ignores modifier-only keys and does not save abandoned attempts', () => {
        ['Shift', 'Control', 'Alt', 'Meta'].forEach(key => recordPracticeKey({ key }));
        expect(getPracticeMetrics().keystrokes).toBe(0);
        recordPracticeKey({ key: 'j' });
        selectGolfTask(0);
        expect(getGolfResult(challenge.tasks[0].id)).toBeNull();
        expect(getPracticeMetrics().keystrokes).toBe(0);
    });
});
