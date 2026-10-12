import { beforeEach, describe, expect, it } from 'vitest';
import * as state from '../../js/core/game-state.js';
import { replay } from '../golden/replay.js';

describe('literal replacement characters and bounded counts', () => {
    beforeEach(() => {
        state.resetGameState();
        state.setContent(['0.1.0']);
        state.setCursor({ row: 0, col: 0 });
    });

    it.each(['0', '2', '9', '/', '?', 'q', '@', '.', ':', 'n', 'r'])('replaces with literal %s instead of interpreting a command', key => {
        replay(['r', key]);
        expect(state.getContent()).toEqual([key + '.1.0']);
        expect(state.getReplacePending()).toBe(false);
        expect(state.getCountBuffer()).toBe('');
        expect(state.getCommandHistory()).toBe('');
        expect(state.getSearchMode()).toBe(false);
        expect(state.getMode()).toBe('NORMAL');
    });

    it('supports counted replacement and undo/redo', () => {
        replay(['2', 'r', '3']);
        expect(state.getContent()).toEqual(['331.0']);
        expect(state.getCursor()).toEqual({ row: 0, col: 1 });
        replay(['u']);
        expect(state.getContent()).toEqual(['0.1.0']);
        replay(['Ctrl+r']);
        expect(state.getContent()).toEqual(['331.0']);
    });

    it('cancels replacement and counts with Escape without leaking into the next command', () => {
        replay(['2', 'r', 'Shift', 'Escape', 'l']);
        expect(state.getContent()).toEqual(['0.1.0']);
        expect(state.getCursor().col).toBe(1);
        expect(state.getReplacePending()).toBe(false);
        replay(['2', '3', '4', 'Escape', 'l']);
        expect(state.getCursor().col).toBe(2);
        expect(state.getCountBuffer()).toBe('');
    });

    it('does not append or partially replace when the count exceeds the remaining line', () => {
        replay(['9', 'r', '2']);
        expect(state.getContent()).toEqual(['0.1.0']);
        expect(state.getReplacePending()).toBe(false);
        state.setContent(['']);
        replay(['r', '2']);
        expect(state.getContent()).toEqual(['']);
    });

    it('can repeat a numeric replacement with dot', () => {
        replay(['r', '2', '2', 'l', '.']);
        expect(state.getContent()).toEqual(['2.2.0']);
        expect(state.getCountBuffer()).toBe('');
    });

    it.each(['l', 'j', 'w', 'e', 'x', 'd', 'p'])('bounds a huge count before executing %s', command => {
        state.setContent(['first second', 'third']);
        state.setYankedLine('copy');
        replay(Array(400).fill('9'));
        expect(state.getCountBuffer()).toBe('1000');
        replay(command === 'd' ? ['d', 'd'] : [command]);
        expect(state.getCountBuffer()).toBe('');
        expect(state.getContent().length).toBeLessThanOrEqual(1002);
        expect(Number.isFinite(state.getCursor().col)).toBe(true);
        expect(Number.isFinite(state.getCursor().row)).toBe(true);
        if (command === 'p') expect(state.getContent()).toHaveLength(1002);
    });

    it('also handles overflowing counts supplied by state safely', () => {
        state.setCountBuffer('9'.repeat(400));
        replay(['d', 'e']);
        expect(state.getContent()).toEqual(['']);
        expect(state.getCountBuffer()).toBe('');
    });
});
