/**
 * Unit tests for challenge task scoring — the single source of truth
 * introduced by TD-6 (the former dead endChallenge/checkChallengeTask
 * exports carried a divergent formula that players never experienced).
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import {
    calculateTaskPoints, challenges, createPracticeChallenge,
    getPracticeMetrics, recordPracticeKey, recordTaskCompletion, resetPracticeMetrics, getPracticeCommands, loadChallengeTask
} from '../../js/practice/challenges.js';
import * as gameState from '../../js/core/game-state.js';
import { replay } from '../golden/replay.js';

describe('calculateTaskPoints (TD-6 single scoring source)', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('awards base 10 plus 1 point per 10 seconds remaining', () => {
        vi.useFakeTimers();
        const challenge = { timeLimit: 90 };
        const startTime = Date.now();

        // Immediately: 90s remaining → 10 + 9
        expect(calculateTaskPoints(challenge, startTime)).toBe(19);

        // After 45s: 45s remaining → 10 + 4
        vi.advanceTimersByTime(45_000);
        expect(calculateTaskPoints(challenge, startTime)).toBe(14);
    });

    it('never awards less than the base points, even after time runs out', () => {
        vi.useFakeTimers();
        const challenge = { timeLimit: 30 };
        const startTime = Date.now();
        vi.advanceTimersByTime(120_000);
        expect(calculateTaskPoints(challenge, startTime)).toBe(10);
    });

    it('challenge definitions still ship the fields scoring depends on', () => {
        for (const challenge of challenges) {
            if (challenge.mode === 'time') expect(typeof challenge.timeLimit).toBe('number');
            else expect(challenge.timeLimit).toBeNull();
            expect(Array.isArray(challenge.tasks)).toBe(true);
            expect(challenge.tasks.length).toBeGreaterThan(0);
        }
    });

    it('creates 30 and 60 second time sessions with enough tasks', () => {
        const shortSession = createPracticeChallenge({ mode: 'time', duration: 30 });
        const longSession = createPracticeChallenge({ mode: 'time', duration: 60 });

        expect(shortSession.timeLimit).toBe(30);
        expect(shortSession.tasks).toHaveLength(30);
        expect(longSession.timeLimit).toBe(60);
        expect(longSession.tasks).toHaveLength(60);
    });

    it('offers only time and golf', () => {
        expect(challenges.map(challenge => challenge.mode)).toEqual(['time', 'golf']);
    });

    it('generates JavaScript functions with at least five body lines', () => {
        const challenge = createPracticeChallenge({ mode: 'commands', commands: ['dw', 'dd', 'ci"'] });
        expect(challenge.tasks).toHaveLength(12);
        expect(challenge.tasks.every(task => task.language === 'javascript')).toBe(true);
        expect(challenge.tasks.every(task => task.initialContent.length >= 7)).toBe(true);
        expect(new Set(challenge.tasks.map(task => task.id)).size).toBe(12);
        expect(new Set(challenge.tasks.map(task => task.initialContent[0])).size).toBe(12);
    });

    it('supports selecting several concrete commands', () => {
        const challenge = createPracticeChallenge({ mode: 'commands', commands: ['dw', '.'] });
        expect(challenge.tasks.every(task => task.commands.some(command => ['dw', '.'].includes(command)))).toBe(true);
        expect(challenge.tasks.some(task => task.commands.includes('dw'))).toBe(true);
        expect(challenge.tasks.some(task => task.commands.includes('.'))).toBe(true);
    });

    it('keeps golf puzzle IDs, buffers and order stable on restart', () => {
        const first = createPracticeChallenge({ mode: 'golf' });
        const second = createPracticeChallenge({ mode: 'golf' });
        expect(second.tasks.map(task => [task.id, task.initialContent, task.targetContent, task.initialCursor]))
            .toEqual(first.tasks.map(task => [task.id, task.initialContent, task.targetContent, task.initialCursor]));
    });

    it('changes the opening task on restart even with deterministic randomness', () => {
        const random = vi.spyOn(Math, 'random').mockReturnValue(0);
        const first = createPracticeChallenge({ mode: 'time', duration: 30 });
        const second = createPracticeChallenge({ mode: 'time', duration: 30 });
        const signature = task => `${task.instruction}\n${task.initialContent.slice(1).join('\n')}`;
        expect(signature(second.tasks[0])).not.toBe(signature(first.tasks[0]));
        const drill = createPracticeChallenge({ mode: 'commands', commands: ['r'] });
        const nextDrill = createPracticeChallenge({ mode: 'commands', commands: ['r'] });
        expect(nextDrill.tasks[0].initialContent).not.toEqual(drill.tasks[0].initialContent);
        random.mockRestore();
    });

    it('tracks keys, deviation, accuracy and clean streaks', () => {
        resetPracticeMetrics();
        ['d', 'w', 'x'].forEach(key => recordPracticeKey({ key }));
        recordTaskCompletion({ optimalKeys: 2, categories: ['motions', 'operators'] });

        const metrics = getPracticeMetrics();
        expect(metrics.keystrokes).toBe(3);
        expect(metrics.deviation).toBe(1);
        expect(metrics.accuracy).toBe(67);
        expect(metrics.streak).toBe(0);
        expect(metrics.categories.operators.attempts).toBe(1);
    });

    it('provides playable drills for every command in the selector', () => {
        for (const command of getPracticeCommands()) {
            const challenge = createPracticeChallenge({ mode: 'commands', commands: [command] });
            expect(challenge.tasks.length, command).toBeGreaterThan(0);
            expect(challenge.tasks.every(task => task.commands.includes(command)), command).toBe(true);
            for (const task of challenge.tasks.filter(task => task.id.startsWith('drill-'))) {
                gameState.resetGameState();
                loadChallengeTask(task, gameState);
                replay(task.solution);
                expect(task.validation(gameState), task.id).toBe(true);
            }
        }
    });
});
