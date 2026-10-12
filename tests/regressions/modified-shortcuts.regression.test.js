import { beforeEach, describe, expect, it } from 'vitest';
import * as state from '../../js/core/game-state.js';
import { handleInsertMode, handleNormalMode, handleSearchMode, handleVisualMode } from '../../js/core/vim-commands.js';

const press = (handler, key, modifiers = {}) => handler({
    key,
    preventDefault() {},
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    ...modifiers
});

describe('unsupported modified shortcuts', () => {
    beforeEach(() => {
        state.resetGameState();
        state.setContent(['abc']);
        state.setCursor({ row: 0, col: 0 });
        state.setMode('NORMAL');
    });

    it.each([
        ['Control', { ctrlKey: true }],
        ['Alt', { altKey: true }],
        ['Meta', { metaKey: true }]
    ])('ignores %s+S in Normal mode', (_name, modifiers) => {
        press(handleNormalMode, 's', modifiers);
        expect(state.getContent()).toEqual(['abc']);
        expect(state.getMode()).toBe('NORMAL');
    });

    it('ignores modified characters in Insert, Visual and Search modes', () => {
        state.setMode('INSERT');
        press(handleInsertMode, 's', { ctrlKey: true });
        expect(state.getContent()).toEqual(['abc']);

        state.setMode('NORMAL');
        press(handleNormalMode, 'v');
        press(handleVisualMode, 'l', { altKey: true });
        expect(state.getCursor()).toEqual({ row: 0, col: 0 });

        state.setMode('NORMAL');
        press(handleNormalMode, '/');
        press(handleSearchMode, 's', { metaKey: true });
        expect(state.getSearchQuery()).toBe('');
    });

    it('keeps supported Ctrl+r and Ctrl+[ behavior', () => {
        press(handleNormalMode, 'x');
        press(handleNormalMode, 'u');
        press(handleNormalMode, 'r', { ctrlKey: true });
        expect(state.getContent()).toEqual(['bc']);
        state.setMode('INSERT');
        state.setCursor({ row: 0, col: 1 });
        press(handleInsertMode, '[', { ctrlKey: true });
        expect(state.getMode()).toBe('NORMAL');
    });
});
