import { beforeEach, describe, expect, it } from 'vitest';
import * as state from '../../js/core/game-state.js';
import { loadLevel, levels } from '../../js/lessons/levels.js';
import { replay } from '../golden/replay.js';
import { initializeDOMReferences, renderEditor, updateStatusBar } from '../../js/ui/ui-components.js';

describe('characterwise Visual mode', () => {
    beforeEach(() => {
        state.resetGameState();
        state.setContent(['LOG_LEVEL=debug_info']);
        state.setCursor({ row: 0, col: 10 });
    });

    it('highlights the inclusive selection and deletes only debug_', () => {
        replay(['v', '5', 'l']);
        expect(state.getMode()).toBe('VISUAL');
        expect(state.getVisualSelection()).toEqual({ start: { row: 0, col: 10 }, end: { row: 0, col: 15 } });

        document.body.innerHTML = '<div id="vim-editor-display"></div><div id="status-bar"></div>';
        initializeDOMReferences();
        renderEditor(state.getContent(), state.getCursor(), state.getMode());
        updateStatusBar('VISUAL', false, '', 'forward', [], -1);
        expect([...document.querySelectorAll('.visual-selection')].map(node => node.textContent).join('')).toBe('debug_');
        expect(document.querySelector('.cursor-normal').textContent).toBe('_');
        expect(document.querySelector('.status-mode-visual').textContent).toBe('VISUAL');

        replay(['d']);
        expect(state.getContent()).toEqual(['LOG_LEVEL=info']);
        expect(state.getMode()).toBe('NORMAL');
        expect(state.getVisualSelection()).toBeNull();
        replay(['u']);
        expect(state.getContent()).toEqual(['LOG_LEVEL=debug_info']);
        expect(state.getMode()).toBe('NORMAL');
    });

    it('deletes a reversed selection with inclusive endpoints', () => {
        state.setCursor({ row: 0, col: 15 });
        replay(['v', '5', 'h', 'd']);
        expect(state.getContent()).toEqual(['LOG_LEVEL=info']);
        expect(state.getCursor()).toEqual({ row: 0, col: 10 });
    });

    it.each(['Escape', 'Ctrl+[', 'v'])('cancels with %s without editing or leaving a pending count', key => {
        replay(['v', '5', 'l', '2', key]);
        expect(state.getContent()).toEqual(['LOG_LEVEL=debug_info']);
        expect(state.getMode()).toBe('NORMAL');
        expect(state.getVisualSelection()).toBeNull();
        expect(state.getCountBuffer()).toBe('');
        replay(['l']);
        expect(state.getCursor().col).toBe(16);
    });

    it('deletes and joins a selection spanning lines', () => {
        state.setContent(['abc', 'def', 'ghi']);
        state.setCursor({ row: 0, col: 1 });
        replay(['v', '2', 'j', 'd']);
        expect(state.getContent()).toEqual(['ai']);
        expect(state.getCursor()).toEqual({ row: 0, col: 1 });
    });

    it('clamps motions onto short lines and can delete the entire buffer', () => {
        state.setContent(['abcdef', 'x', '']);
        state.setCursor({ row: 0, col: 5 });
        replay(['v', 'j']);
        expect(state.getCursor()).toEqual({ row: 1, col: 0 });
        replay(['g', 'g', 'G', 'd']);
        expect(state.getContent()).toEqual(['abcde']);

        replay(['0', 'v', '$', 'd']);
        expect(state.getContent()).toEqual(['']);
        expect(state.getCursor()).toEqual({ row: 0, col: 0 });
    });

    it('resets the selection when loading another lesson', () => {
        replay(['v', '5', 'l']);
        loadLevel(levels.findIndex(lesson => lesson.id === 'lesson-visual-delete-v'));
        expect(state.getMode()).toBe('NORMAL');
        expect(state.getVisualSelection()).toBeNull();
    });

    it('changes a selected path segment and groups it into one undo step', () => {
        state.setContent(['CACHE_DIR=/tmp/cache']);
        state.setCursor({ row: 0, col: 11 });
        replay(['v', '2', 'l', 'c']);
        expect(state.getMode()).toBe('INSERT');
        expect(state.getContent()).toEqual(['CACHE_DIR=//cache']);
        expect(state.getCursor().col).toBe(11);
        replay(['v', 'a', 'r', 'Escape']);
        expect(state.getContent()).toEqual(['CACHE_DIR=/var/cache']);
        replay(['u']);
        expect(state.getContent()).toEqual(['CACHE_DIR=/tmp/cache']);
        expect(state.getMode()).toBe('NORMAL');
    });

    it('changes the selected final character at the insertion position', () => {
        state.setContent(['PORT=x']);
        state.setCursor({ row: 0, col: 5 });
        replay(['v', 'c', '3', '0', '0', '0', 'Escape']);
        expect(state.getContent()).toEqual(['PORT=3000']);
    });

    it('selects and deletes a complete line from a cursor inside it', () => {
        state.setContent(['LOG_LEVEL=info', 'DEBUG_TRACE=true', 'API_PORT=3000']);
        state.setCursor({ row: 1, col: 6 });
        replay(['V']);
        expect(state.getVisualSelection()).toEqual({ start: { row: 1, col: 0 }, end: { row: 1, col: 15 }, linewise: true });

        document.body.innerHTML = '<div id="vim-editor-display"></div><div id="status-bar"></div>';
        initializeDOMReferences();
        renderEditor(state.getContent(), state.getCursor(), state.getMode());
        updateStatusBar('VISUAL', false, '', 'forward', [], -1);
        expect(document.querySelector('.visual-line-selection').textContent).toContain('DEBUG_TRACE=true');
        expect(document.querySelector('.status-mode-visual').textContent).toBe('VISUAL LINE');

        replay(['d']);
        expect(state.getContent()).toEqual(['LOG_LEVEL=info', 'API_PORT=3000']);
        expect(state.getMode()).toBe('NORMAL');
        expect(state.getCursor()).toEqual({ row: 1, col: 0 });
        replay(['u']);
        expect(state.getContent()).toEqual(['LOG_LEVEL=info', 'DEBUG_TRACE=true', 'API_PORT=3000']);
    });

    it('copies multiple whole lines in order, including a blank line', () => {
        state.setContent(['[development]', 'LOG_LEVEL=info', '', '[production]']);
        state.setCursor({ row: 1, col: 6 });
        replay(['V', 'j', 'y']);
        expect(state.getContent()).toEqual(['[development]', 'LOG_LEVEL=info', '', '[production]']);
        expect(state.getMode()).toBe('NORMAL');
        expect(state.getYankedLine()).toEqual(['LOG_LEVEL=info', '']);
        replay(['G', 'p']);
        expect(state.getContent()).toEqual(['[development]', 'LOG_LEVEL=info', '', '[production]', 'LOG_LEVEL=info', '']);
        expect(state.getCursor()).toEqual({ row: 4, col: 0 });
        replay(['u']);
        expect(state.getContent()).toEqual(['[development]', 'LOG_LEVEL=info', '', '[production]']);
    });

    it('deletes whole lines in a reversed selection and keeps an empty buffer usable', () => {
        state.setContent(['LOG_LEVEL=info', 'DEBUG_TRACE=true']);
        state.setCursor({ row: 1, col: 6 });
        replay(['V', 'k', 'd']);
        expect(state.getContent()).toEqual(['']);
        expect(state.getCursor()).toEqual({ row: 0, col: 0 });
        expect(state.getMode()).toBe('NORMAL');
    });

    it('can change a whole line without joining its neighbors', () => {
        state.setContent(['[development]', 'LOG_LEVEL=debug', '[production]']);
        state.setCursor({ row: 1, col: 6 });
        replay(['V', 'c']);
        expect(state.getContent()).toEqual(['[development]', '', '[production]']);
        expect(state.getMode()).toBe('INSERT');
        replay([...'LOG_LEVEL=info', 'Escape']);
        expect(state.getContent()).toEqual(['[development]', 'LOG_LEVEL=info', '[production]']);
    });

    it('switches between characterwise and linewise selection and cancels it', () => {
        replay(['v', 'V']);
        expect(state.getVisualSelection().linewise).toBe(true);
        replay(['v']);
        expect(state.getVisualSelection().start.col).toBe(10);
        expect(state.getVisualLinewise()).toBe(false);
        replay(['V', 'V']);
        expect(state.getMode()).toBe('NORMAL');
        expect(state.getVisualSelection()).toBeNull();
    });
});
