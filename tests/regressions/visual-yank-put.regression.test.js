import { beforeEach, describe, expect, it } from 'vitest';
import * as state from '../../js/core/game-state.js';
import { replay } from '../golden/replay.js';

describe('Visual yank and characterwise put', () => {
    beforeEach(() => {
        state.resetGameState();
        state.setContent(['keyboard,', 'mouse,89,12']);
        state.setCursor({ row: 1, col: 6 });
    });

    it('copies CSV values without modifying the source or creating an undo entry', () => {
        replay(['v', '4', 'l', 'y']);
        expect(state.getMode()).toBe('NORMAL');
        expect(state.getVisualSelection()).toBeNull();
        expect(state.getCursor()).toEqual({ row: 1, col: 6 });
        expect(state.getContent()).toEqual(['keyboard,', 'mouse,89,12']);
        expect(state.getUndoStack()).toHaveLength(0);

        replay(['k', '$', 'p']);
        expect(state.getContent()).toEqual(['keyboard,89,12', 'mouse,89,12']);
        expect(state.getCursor()).toEqual({ row: 0, col: 13 });
        replay(['u']);
        expect(state.getContent()).toEqual(['keyboard,', 'mouse,89,12']);
        replay(['Ctrl+r']);
        expect(state.getContent()).toEqual(['keyboard,89,12', 'mouse,89,12']);
    });

    it('copies a reversed selection with inclusive endpoints', () => {
        state.setCursor({ row: 1, col: 10 });
        replay(['v', '4', 'h', 'y', 'k', '$', 'p']);
        expect(state.getContent()).toEqual(['keyboard,89,12', 'mouse,89,12']);
    });

    it.each([
        ['p', '[]89,12', 6],
        ['P', '[89,12]', 5]
    ])('%s pastes on the appropriate side of the cursor', (key, expected, col) => {
        replay(['v', '4', 'l', 'y']);
        state.setContent(['[]']);
        state.setCursor({ row: 0, col: 1 });
        replay([key]);
        expect(state.getContent()).toEqual([expected]);
        expect(state.getCursor()).toEqual({ row: 0, col });
    });

    it('repeats characterwise puts with counts and dot', () => {
        replay(['v', '4', 'l', 'y', 'k', '$', '3', 'p']);
        expect(state.getContent()[0]).toBe('keyboard,' + '89,12'.repeat(3));
        expect(state.getCountBuffer()).toBe('');
        replay(['.']);
        expect(state.getContent()[0]).toBe('keyboard,' + '89,12'.repeat(6));
        replay(['u']);
        expect(state.getContent()[0]).toBe('keyboard,' + '89,12'.repeat(3));
    });

    it('copies text spanning multiple lines, including a blank line', () => {
        state.setContent(['abc', '', 'def', '[]']);
        state.setCursor({ row: 0, col: 1 });
        replay(['v', '2', 'j', 'y']);
        expect(state.getContent()).toEqual(['abc', '', 'def', '[]']);
        expect(state.getCursor()).toEqual({ row: 0, col: 1 });
        replay(['G', '0', 'p']);
        expect(state.getContent()).toEqual(['abc', '', 'def', '[bc', '', 'de]']);
        expect(state.getCursor()).toEqual({ row: 3, col: 1 });
        replay(['u']);
        expect(state.getContent()).toEqual(['abc', '', 'def', '[]']);
    });

    it.each(['p', 'P'])('%s can paste characters into an empty line', key => {
        replay(['v', '4', 'l', 'y']);
        state.setContent(['']);
        state.setCursor({ row: 0, col: 0 });
        replay([key]);
        expect(state.getContent()).toEqual(['89,12']);
        expect(state.getCursor()).toEqual({ row: 0, col: 4 });
    });

    it('puts visually deleted characters back before the cursor', () => {
        state.setContent(['abcdef']);
        state.setCursor({ row: 0, col: 1 });
        replay(['v', '2', 'l', 'd', 'P']);
        expect(state.getContent()).toEqual(['abcdef']);
    });

    it('switches from characterwise to linewise copying without leaking the register type', () => {
        replay(['v', '4', 'l', 'y', 'k', 'y', 'y', 'G', 'P']);
        expect(state.getContent()).toEqual(['keyboard,', 'keyboard,', 'mouse,89,12']);
        expect(state.getCursor()).toEqual({ row: 1, col: 0 });
        replay(['u', 'Ctrl+r']);
        expect(state.getContent()).toEqual(['keyboard,', 'keyboard,', 'mouse,89,12']);
    });

    it('keeps register snapshots isolated from callers', () => {
        replay(['v', '4', 'l', 'y']);
        const register = state.getYankedLine();
        register.text = 'changed';
        const snapshot = state.cloneState();
        snapshot.yankedLine.text = 'also changed';
        replay(['k', '$', 'p']);
        expect(state.getContent()[0]).toBe('keyboard,89,12');
    });
});
