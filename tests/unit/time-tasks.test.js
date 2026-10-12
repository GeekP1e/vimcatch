import { beforeEach, describe, expect, it } from 'vitest';
import * as state from '../../js/core/game-state.js';
import { timeTasks } from '../../js/practice/time-tasks.js';
import { golfTasks } from '../../js/practice/golf-tasks.js';
import { createPracticeChallenge, loadChallengeTask } from '../../js/practice/challenges.js';
import { replay } from '../golden/replay.js';

describe('independent Time Attack task bank', () => {
    beforeEach(() => state.resetGameState());

    it('has no shared IDs or puzzle buffers with golf', () => {
        expect(timeTasks).toHaveLength(20);
        const golfIds = new Set(golfTasks.map(task => task.id));
        const golfStarts = new Set(golfTasks.map(task => JSON.stringify(task.initialContent)));
        const golfTargets = new Set(golfTasks.map(task => JSON.stringify(task.targetContent)));
        for (const task of timeTasks) {
            expect(golfIds.has(task.id), task.id).toBe(false);
            expect(golfStarts.has(JSON.stringify(task.initialContent)), task.id).toBe(false);
            expect(golfTargets.has(JSON.stringify(task.targetContent)), task.id).toBe(false);
        }
    });

    it('verifies the solution for every timed puzzle', () => {
        const challenge = createPracticeChallenge({ mode: 'time', duration: 30 });
        for (const task of new Map(challenge.tasks.map(task => [task.id, task])).values()) {
            state.resetGameState();
            loadChallengeTask(task, state);
            replay(task.solution);
            expect(state.getContent(), task.id).toEqual(task.targetContent);
            expect(task.validation(state), task.id).toBe(true);
        }
    });

    it('uses only time tasks at every supported duration', () => {
        const ids = new Set(timeTasks.map(task => task.id));
        for (const duration of [30, 60, 120, 300]) {
            const challenge = createPracticeChallenge({ mode: 'time', duration });
            expect(challenge.tasks).toHaveLength(duration);
            expect(challenge.tasks.every(task => ids.has(task.id))).toBe(true);
        }
    });
});
