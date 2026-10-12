import { beforeEach, describe, expect, it } from 'vitest';
import * as state from '../../js/core/game-state.js';
import { replay } from '../golden/replay.js';

describe('undo and redo history', () => {
    beforeEach(() => {
        state.resetGameState();
        state.setContent(['abc']);
        state.setCursor({ row: 0, col: 0 });
        state.setMode('NORMAL');
    });

    it('undoes text inserted with i', () => {
        replay(['i', 'X', 'Escape']);
        expect(state.getContent()).toEqual(['Xabc']);
        replay(['u']);
        expect(state.getContent()).toEqual(['abc']);
    });

    it('consumes a redo entry instead of toggling between states', () => {
        replay(['x', 'u']);
        expect(state.getContent()).toEqual(['abc']);
        replay(['Ctrl+r']);
        expect(state.getContent()).toEqual(['bc']);
        expect(state.getRedoStack()).toEqual([]);
        replay(['Ctrl+r']);
        expect(state.getContent()).toEqual(['bc']);
    });
});
