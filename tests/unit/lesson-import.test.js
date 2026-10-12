import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLessonTemplate } from '../../js/ui/cheat-mode.js';
import { deleteCustomLesson, importCustomLesson, restoreCustomLessons, validateImportedLesson } from '../../js/lessons/lesson-import.js';
import { levels, loadLevel } from '../../js/lessons/levels.js';
import { initializeDOMReferences, updateInstructions } from '../../js/ui/ui-components.js';
import { openTrainingLesson } from '../../js/ui/event-handlers.js';
import { getChallengeMode, getCurrentChallenge, getChallengeTimerInterval, setChallengeMode, setCurrentChallenge, setChallengeTimerInterval, resetChallengeState } from '../../js/core/game-state.js';
import { getCurrentLevel, getCompletedLessonIds, markLessonCompleted, resetGameState, getContent, setContent } from '../../js/core/game-state.js';

const bundledCount = levels.length;

describe('lesson JSON import', () => {
    beforeEach(() => { localStorage.clear(); resetGameState(); });

    afterEach(() => {
        resetChallengeState();
        vi.useRealTimers();
        vi.restoreAllMocks();
        levels.splice(bundledCount);
        localStorage.clear();
    });

    it('adds and persists a valid lesson', () => {
        const lesson = createLessonTemplate();
        lesson.id = 'lesson-user-import';
        lesson.metadata.order = 999;

        const result = importCustomLesson(lesson);

        expect(result.success).toBe(true);
        expect(levels[result.index].id).toBe(lesson.id);
        expect(Object.isFrozen(levels[result.index])).toBe(true);
        expect(JSON.parse(localStorage.getItem('vimcatch-custom-lessons-v1'))[0].id).toBe(lesson.id);
    });

    it('restores saved lessons after reload initialization', () => {
        const lesson = createLessonTemplate();
        lesson.id = 'lesson-user-restored';
        lesson.metadata.order = 999;
        localStorage.setItem('vimcatch-custom-lessons-v1', JSON.stringify([lesson]));

        expect(restoreCustomLessons()).toBe(1);
        expect(levels.at(-1).id).toBe(lesson.id);
    });

    it('rejects unknown fields and bundled IDs', () => {
        const unknown = { ...createLessonTemplate(), ignoredSetup: true };
        expect(validateImportedLesson(unknown)).toContain('unknown: ignoredSetup');

        const bundled = createLessonTemplate();
        bundled.id = levels[0].id;
        expect(importCustomLesson(bundled)).toEqual({ success: false, errors: ['bundled-id'] });
    });

    it.each([
        [{ id: ['lesson-array-id'] }, 'id'],
        [{ focusCommand: {} }, 'focusCommand'],
        [{ focusCommand: 42 }, 'focusCommand']
    ])('rejects malformed field types before storing them: %o', (fields, field) => {
        const result = importCustomLesson({ ...createLessonTemplate(), ...fields });
        expect(result.success).toBe(false);
        expect(result.errors).toContain(field);
        expect(localStorage.getItem('vimcatch-custom-lessons-v1')).toBeNull();
        expect(levels).toHaveLength(bundledCount);
    });

    it('renders imported command text without creating HTML elements', () => {
        const payload = '<img src="bad" onerror="window.injected=true">';
        const result = importCustomLesson({ ...createLessonTemplate(), focusCommand: payload });
        loadLevel(result.index);
        document.body.innerHTML = '<div id="instructions"></div>';
        initializeDOMReferences();
        updateInstructions();

        expect(document.querySelector('#instructions img')).toBeNull();
        expect(document.getElementById('instructions').textContent).toContain(payload);
    });

    it('opens an imported lesson in training and stops the practice timer', () => {
        vi.useFakeTimers();
        const tick = vi.fn();
        setChallengeMode(true);
        setCurrentChallenge({ mode: 'golf', tasks: [] });
        setChallengeTimerInterval(setInterval(tick, 1000));
        document.body.innerHTML = '<div id="challenge-container"></div>';
        initializeDOMReferences();
        const result = importCustomLesson(createLessonTemplate());

        expect(openTrainingLesson(result.index)).toBe(true);
        expect(getChallengeMode()).toBe(false);
        expect(getCurrentChallenge()).toBeNull();
        expect(getChallengeTimerInterval()).toBeNull();
        expect(getContent()).toEqual(result.lesson.initialContent);
        expect(document.getElementById('challenge-container').classList.contains('hidden')).toBe(true);
        vi.advanceTimersByTime(2000);
        expect(tick).not.toHaveBeenCalled();
    });

    it('deletes the active custom lesson and its completion, without restoring it on reload', () => {
        const result = importCustomLesson(createLessonTemplate());
        loadLevel(result.index);
        markLessonCompleted(result.lesson.id);

        expect(deleteCustomLesson(result.lesson.id).success).toBe(true);
        expect(levels).toHaveLength(bundledCount);
        expect(getCurrentLevel()).toBe(bundledCount - 1);
        expect(getCompletedLessonIds().has(result.lesson.id)).toBe(false);
        expect(restoreCustomLessons()).toBe(0);
    });

    it('preserves the active lesson and edits when an earlier custom lesson is deleted', () => {
        const first = importCustomLesson(createLessonTemplate());
        const second = importCustomLesson({ ...createLessonTemplate(), id: 'lesson-user-second' });
        loadLevel(second.index);
        setContent(['unfinished edit']);

        expect(deleteCustomLesson(first.lesson.id).success).toBe(true);
        expect(levels[getCurrentLevel()].id).toBe(second.lesson.id);
        expect(getContent()).toEqual(['unfinished edit']);
    });

    it('keeps lessons when storage fails and refuses to delete bundled lessons', () => {
        const result = importCustomLesson(createLessonTemplate());
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('full'); });

        expect(deleteCustomLesson(result.lesson.id).success).toBe(false);
        expect(levels[result.index].id).toBe(result.lesson.id);
        expect(deleteCustomLesson(levels[0].id).success).toBe(false);
    });
});
