import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleSearchInput } from '../../js/main.js';
import { handleNormalMode, handleSearchMode } from '../../js/core/vim-commands.js';
import { levels, loadLevel } from '../../js/lessons/levels.js';
import * as state from '../../js/core/game-state.js';

const press = (handler, key) => handler({
    key,
    preventDefault() {},
    ctrlKey: false,
    altKey: false,
    shiftKey: false
});

describe('search lesson completion', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        state.resetGameState();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('completes a lesson whose final solution key is search Enter', () => {
        const index = levels.findIndex(lesson => lesson.id === 'lesson-search-backward');
        loadLevel(index);
        press(handleNormalMode, '?');
        [...'alpha'].forEach(key => press(handleSearchMode, key));

        press(handleSearchInput, 'Enter');
        vi.advanceTimersByTime(500);

        expect(state.getCompletedLessonIds().has(levels[index].id)).toBe(true);
        expect(state.getCurrentLevel()).toBe(index + 1);
    });
});
