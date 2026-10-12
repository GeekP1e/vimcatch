import { describe, expect, it } from 'vitest';
import { evaluateWinCondition } from '../../js/lessons/win-evaluator.js';

describe('declarative lesson requirements', () => {
    it('evaluates search behavior without depending on the lesson name', () => {
        const lesson = {
            name: 'Renamed freely',
            target: { row: 1, col: 3 },
            requires: [{ type: 'search', direction: 'forward', query: 'target', minNavigations: 1 }]
        };
        const state = {
            cursor: { row: 1, col: 3 },
            usedSearchInLevel: true,
            lastSearchDirection: 'forward',
            lastSearchQuery: 'TARGET',
            navCountSinceSearch: 1
        };

        expect(evaluateWinCondition(state, lesson).won).toBe(true);
        expect(evaluateWinCondition({ ...state, lastSearchQuery: 'other' }, lesson).won).toBe(false);
    });

    it('requires redo after undo independently of lesson identity', () => {
        const lesson = {
            name: 'Any display name',
            targetContent: ['done'],
            requires: [{ type: 'undoThenRedo' }]
        };
        const state = { content: ['done'], mode: 'NORMAL', usedRedoAfterUndo: true };

        expect(evaluateWinCondition(state, lesson).won).toBe(true);
        expect(evaluateWinCondition({ ...state, usedRedoAfterUndo: false }, lesson).won).toBe(false);
    });

    it('rejects malformed requirements without throwing', () => {
        const lesson = {
            target: { row: 0, col: 0 },
            requires: [{ type: 'search', direction: 'forward' }]
        };
        const state = {
            cursor: { row: 0, col: 0 },
            usedSearchInLevel: true,
            lastSearchDirection: 'forward',
            lastSearchQuery: 'target',
            navCountSinceSearch: 0
        };

        expect(() => evaluateWinCondition(state, lesson)).not.toThrow();
        expect(evaluateWinCondition(state, lesson).won).toBe(false);
        expect(evaluateWinCondition(state, { ...lesson, requires: { type: 'search' } }).won).toBe(false);
    });

    it('rejects malformed objectives without throwing', () => {
        const state = { content: ['done'], mode: 'NORMAL' };
        const lesson = { targetContent: 'done' };

        expect(() => evaluateWinCondition(state, lesson)).not.toThrow();
        expect(evaluateWinCondition(state, lesson)).toEqual({
            won: false,
            reason: 'Lesson objective is invalid'
        });
    });
});
