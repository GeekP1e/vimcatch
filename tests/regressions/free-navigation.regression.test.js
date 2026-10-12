import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupMockStorage } from '../helpers/mock-storage.js';
import { levels, loadLevel } from '../../js/lessons/levels.js';
import { navigateToLevel, checkWinCondition, maybeAwardBadges } from '../../js/ui/event-handlers.js';
import { progressSystem } from '../../js/storage/progress-system.js';
import {
    resetGameState, getCurrentLevel, getCompletedLessonIds,
    markLessonCompleted, setXp, getXp, setCombo, getCombo, getBadges,
    setCursor, setChallengeMode, setContent
} from '../../js/core/game-state.js';
import { initializeDOMReferences, createLevelButtons, setCurriculumExplorerExpanded } from '../../js/ui/ui-components.js';
import { resetRetentionState } from '../../js/storage/retention-state.js';

describe('Free navigation and independent saved completion', () => {
    beforeEach(() => {
        setupMockStorage();
        resetGameState();
        setChallengeMode(false);
        setXp(0);
        setCombo(0);
        loadLevel(0);
        document.body.innerHTML = '<div id="level-selection"></div>';
        initializeDOMReferences();
    });

    afterEach(() => {
        setCurriculumExplorerExpanded(false);
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('allows skipping to the last lesson and immediately saves the selection without fake completions', () => {
        expect(navigateToLevel(levels.length - 1)).toBe(true);
        const saved = JSON.parse(localStorage.getItem(progressSystem.storageKey));
        expect(saved.currentLevel).toBe(levels.length - 1);
        expect(saved.completedLessonIds).toEqual([]);
        expect(document.getElementById('minimal-progress').textContent).not.toContain('█');
        expect(document.querySelector('.curriculum-console-progress')).toBeNull();
        expect(navigateToLevel(0)).toBe(true);
        expect(getCurrentLevel()).toBe(0);
        expect(navigateToLevel(-1)).toBe(false);
        expect(navigateToLevel(levels.length)).toBe(false);
    });

    it('awards the beginner badge only after all three basic lessons are completed', () => {
        vi.useFakeTimers();
        loadLevel(3);
        markLessonCompleted(levels[3].id);
        maybeAwardBadges();
        expect(getBadges().has('beginner')).toBe(false);

        levels.slice(0, 3).forEach((lesson) => markLessonCompleted(lesson.id));
        maybeAwardBadges();
        expect(getBadges().has('beginner')).toBe(true);
        vi.runAllTimers();
    });

    it('offers every lesson before any progress, including custom lessons outside the fixed chapter list', () => {
        const custom = { id: 'lesson-custom', name: 'Custom <lesson>', focusCommand: 'w' };
        createLevelButtons([...levels, custom], 0);
        expect(document.querySelector('select')).toBeNull();
        expect(document.querySelectorAll('.curriculum-node--locked')).toHaveLength(0);
        setCurriculumExplorerExpanded(true);
        createLevelButtons([...levels, custom], 0);
        expect([...document.querySelectorAll('.curriculum-section-title')].at(-1).textContent).toBe('My lessons');
        expect(document.querySelector(`[data-level="${levels.length}"] .curriculum-node-name`).textContent).toBe('Custom <lesson>');
    });

    it('excludes custom lessons from bundled course progress', () => {
        const totalLevels = progressSystem.getProgressSummary().totalLevels;
        const custom = { id: 'lesson-custom-progress' };
        levels.push(custom);
        markLessonCompleted(custom.id);
        try {
            expect(progressSystem.getProgressSummary()).toMatchObject({ totalLevels, completedLessons: 0 });
        } finally {
            levels.pop();
        }
    });

    it('shows every bundled lesson in the curriculum map', () => {
        setCurriculumExplorerExpanded(true);
        createLevelButtons(levels, 0);

        const mappedIds = [...document.querySelectorAll('.curriculum-node')]
            .map((node) => levels[Number(node.dataset.level)].id);
        expect(new Set(mappedIds)).toEqual(new Set(levels.map((lesson) => lesson.id)));
        expect(mappedIds).toHaveLength(levels.length);
        const visualSection = [...document.querySelectorAll('.curriculum-section')]
            .find(section => section.querySelector('.curriculum-section-title').textContent === 'Visual');
        expect([...visualSection.querySelectorAll('.curriculum-node')].map(node => levels[Number(node.dataset.level)].id)).toEqual([
            'lesson-visual-delete-v', 'lesson-visual-change-c', 'lesson-visual-line-delete', 'lesson-visual-line-copy', 'lesson-visual-text-copy'
        ]);
    });

    it('keeps a completed later lesson when revisiting earlier lessons and restores XP, combo and completion', () => {
        const last = levels[levels.length - 1];
        markLessonCompleted(last.id);
        setXp(75);
        setCombo(3);
        navigateToLevel(0);
        resetGameState();
        setXp(0);
        setCombo(0);
        expect(progressSystem.autoLoadProgress().loaded).toBe(true);
        expect(getCompletedLessonIds()).toEqual(new Set([last.id]));
        expect(getXp()).toBe(75);
        expect(getCombo()).toBe(3);
        expect(getCurrentLevel()).toBe(0);
        const exported = progressSystem.exportProgress();
        resetGameState();
        expect(progressSystem.importProgress(exported).success).toBe(true);
        expect(getCompletedLessonIds()).toEqual(new Set([last.id]));
    });

    it('records the actual won lesson and persists its completion', () => {
        vi.useFakeTimers();
        const index = levels.findIndex((lesson) => lesson.target);
        loadLevel(index);
        setCursor(levels[index].target);
        checkWinCondition();
        vi.runAllTimers();
        const saved = JSON.parse(localStorage.getItem(progressSystem.storageKey));
        expect(saved.completedLessonIds).toContain(levels[index].id);
        expect(saved.completedLessonIds).toHaveLength(1);
        expect(saved.xp).toBeGreaterThan(0);
        expect(getCurrentLevel()).toBe(index + 1);
        expect(saved.currentLevel).toBe(index + 1);
    });

    it('does not complete the course when only the last lesson is finished', () => {
        vi.useFakeTimers();
        resetRetentionState();
        const index = levels.length - 1;
        loadLevel(index);
        setContent(levels[index].targetContent);

        checkWinCondition();
        vi.runAllTimers();

        expect(getCompletedLessonIds()).toEqual(new Set([levels[index].id]));
        expect(JSON.parse(localStorage.getItem('vimMasterRetentionState')).completedAllLessons).toBe(false);
    });

    it('shows the celebration when all bundled lessons are complete', () => {
        vi.useFakeTimers();
        document.body.innerHTML = '<div id="celebration" class="hidden"></div><div id="level-selection"></div>';
        initializeDOMReferences();
        const bundledCount = levels.length;
        levels.push({ id: 'lesson-custom-after-course' });
        try {
            levels.slice(0, bundledCount - 1).forEach(lesson => markLessonCompleted(lesson.id));
            const index = bundledCount - 1;
            loadLevel(index);
            setContent(levels[index].targetContent);

            checkWinCondition();
            vi.runAllTimers();

            expect(document.getElementById('celebration').classList.contains('hidden')).toBe(false);
            const retention = JSON.parse(localStorage.getItem('vimMasterRetentionState'));
            expect(retention.resumeSnapshot.totalLevels).toBe(bundledCount);
        } finally {
            levels.pop();
        }
    });

    it('does not award completion to a new lesson when navigating during the win animation', () => {
        vi.useFakeTimers();
        const index = levels.findIndex((lesson) => lesson.target);
        loadLevel(index);
        setCursor(levels[index].target);
        checkWinCondition();
        navigateToLevel(levels.length - 1);
        vi.runAllTimers();
        expect(getCompletedLessonIds().has(levels[levels.length - 1].id)).toBe(false);
        expect(getCurrentLevel()).toBe(levels.length - 1);
    });

    it('does not award completion or XP after resetting the same lesson', () => {
        vi.useFakeTimers();
        const index = levels.findIndex((lesson) => lesson.target);
        loadLevel(index);
        setCursor(levels[index].target);
        checkWinCondition();
        loadLevel(index);
        vi.runAllTimers();

        expect(getCompletedLessonIds().has(levels[index].id)).toBe(false);
        expect(getXp()).toBe(0);
        expect(getCurrentLevel()).toBe(index);
    });

    it('allows a new completion while an old session callback is pending', () => {
        vi.useFakeTimers();
        const index = levels.findIndex((lesson) => lesson.target);
        loadLevel(index);
        setCursor(levels[index].target);
        checkWinCondition();
        loadLevel(index);
        setCursor(levels[index].target);
        checkWinCondition();
        vi.runAllTimers();

        expect(getCompletedLessonIds().has(levels[index].id)).toBe(true);
        expect(getXp()).toBe(15);
    });
});
