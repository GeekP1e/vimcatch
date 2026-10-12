import { beforeEach, describe, expect, it } from 'vitest';
import { resetGameState, setContent, setCursor, getContent, getCursor, getMode } from '../../js/core/game-state.js';
import { replay } from '../golden/replay.js';

describe('Vim Tutor operators and motions', () => {
    beforeEach(() => {
        resetGameState();
        setContent(['alpha beta gamma']);
        setCursor({ row: 0, col: 0 });
    });

    it.each([
        [['d', 'e'], ' beta gamma'],
        [['d', '2', 'e'], ' gamma'],
        [['d', '$'], ''],
        [['c', 'e', 'o', 'k', 'Escape'], 'ok beta gamma'],
        [['c', '$', 'o', 'k', 'Escape'], 'ok']
    ])('applies %j without also moving the cursor', (keys, expected) => {
        replay(keys);
        expect(getContent()).toEqual([expected]);
        expect(getMode()).toBe('NORMAL');
    });

    it('undoes an operator edit', () => {
        replay(['d', '$', 'u']);
        expect(getContent()).toEqual(['alpha beta gamma']);
    });

    it('appends with A from the middle of the line', () => {
        setCursor({ row: 0, col: 4 });
        replay(['A', '!', 'Escape']);
        expect(getContent()).toEqual(['alpha beta gamma!']);
    });

    it('matches nested brackets across lines in both directions', () => {
        setContent(['outer(', 'inner(value)', ')']);
        setCursor({ row: 0, col: 5 });
        replay(['%']);
        expect(getCursor()).toEqual({ row: 2, col: 0 });
        replay(['%']);
        expect(getCursor()).toEqual({ row: 0, col: 5 });
    });

    it('leaves the cursor in place when no bracket matches', () => {
        setContent(['unclosed(']);
        setCursor({ row: 0, col: 0 });
        replay(['%']);
        expect(getCursor()).toEqual({ row: 0, col: 0 });
    });
});
