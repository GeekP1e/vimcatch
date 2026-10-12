import { beforeEach, describe, expect, it } from 'vitest';
import * as state from '../../js/core/game-state.js';
import { replay } from '../golden/replay.js';

describe('substitute character command', () => {
    beforeEach(() => {
        state.resetGameState();
        state.setContent(['API_URL=http:xlocalhost:3000']);
        state.setCursor({ row: 0, col: 13 });
        state.setMode('NORMAL');
    });

    it('replaces one character with multiple characters through INSERT mode', () => {
        replay(['s', '/', '/', 'Escape']);

        expect(state.getContent()).toEqual(['API_URL=http://localhost:3000']);
        expect(state.getMode()).toBe('NORMAL');
        expect(state.getCursor()).toEqual({ row: 0, col: 14 });
    });

    it('supports a count and can be undone', () => {
        state.setContent(['value=abcd']);
        state.setCursor({ row: 0, col: 6 });

        replay(['2', 's', 'x', 'Escape']);
        expect(state.getContent()).toEqual(['value=xcd']);
        replay(['u']);
        expect(state.getContent()).toEqual(['value=abcd']);
    });
});
