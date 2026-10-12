import { beforeEach, describe, expect, it } from 'vitest';
import { levels, loadLevel } from '../../js/lessons/levels.js';
import { getContent, getCursor, getOpenedFile, getCommandHistory, getCommandLog, getLastExCommand, resetGameState } from '../../js/core/game-state.js';
import { initializeDOMReferences, updateStatusBar } from '../../js/ui/ui-components.js';
import { replay } from '../golden/replay.js';
import { evaluateWinCondition } from '../../js/lessons/win-evaluator.js';

describe('opening a virtual file', () => {
    const index = levels.findIndex(lesson => lesson.id === 'lesson-edit-file');

    beforeEach(() => {
        resetGameState();
        loadLevel(index);
    });

    it('opens the file buffer and displays its name', () => {
        replay([':', ...'e notes.txt', 'Enter']);
        expect(getContent()).toEqual(levels[index].files['notes.txt']);
        expect(getCursor()).toEqual({ row: 0, col: 0 });
        expect(getOpenedFile()).toBe('notes.txt');
        document.body.innerHTML = '<div id="status-bar"></div>';
        initializeDOMReferences();
        updateStatusBar('NORMAL', false, '', 'forward', [], -1);
        expect(document.getElementById('status-bar').textContent).toContain('notes.txt');
        loadLevel(index);
        expect(getOpenedFile()).toBeNull();
        expect(getContent()).toEqual(levels[index].initialContent);
    });

    it('keeps the workspace when an unknown filename is entered', () => {
        replay([':', ...'e missing.txt', 'Enter']);
        expect(getContent()).toEqual(levels[index].initialContent);
        expect(getOpenedFile()).toBeNull();
    });

    it('requires editing the opened file and returning to Normal mode', () => {
        const lesson = levels[index];
        replay([':', ...'e notes.txt', 'Enter']);
        expect(evaluateWinCondition({ content: getContent(), mode: 'NORMAL' }, lesson).won).toBe(false);
        replay(['j', 'w', 'c', 'w', ...'ready']);
        expect(evaluateWinCondition({ content: getContent(), mode: 'INSERT' }, lesson).won).toBe(false);
        replay(['Escape']);
        expect(getContent()).toEqual(lesson.targetContent);
        expect(evaluateWinCondition({ content: getContent(), mode: 'NORMAL' }, lesson).won).toBe(true);
    });

    it('allows correcting a filename with Backspace before opening it', () => {
        replay([':', ...'e notez', 'Backspace']);
        expect(getCommandHistory()).toBe(':e note');
        expect(getCommandLog().join('')).toBe(':e note');
        replay([...'s.txt', 'Enter']);
        expect(getOpenedFile()).toBe('notes.txt');
        expect(getContent()).toEqual(levels[index].files['notes.txt']);
    });

    it.each(['Escape', 'Ctrl+['])('cancels an Ex command with %s', key => {
        replay([':', ...'e wrong.txt', key]);
        expect(getCommandHistory()).toBe('');
        expect(getCommandLog()).toEqual([]);
        expect(getLastExCommand()).toBeNull();
        replay(levels[index].solution);
        expect(getOpenedFile()).toBe('notes.txt');
    });

    it('leaves command entry when Backspace removes the colon', () => {
        replay([':', 'Backspace', 'j']);
        expect(getCursor().row).toBe(1);
        expect(getOpenedFile()).toBeNull();
    });
});
