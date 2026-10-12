import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRetentionViewModel, initializeRetentionState, resetRetentionState } from '../../js/storage/retention-state.js';

describe('retention state storage fallback', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        resetRetentionState();
    });

    it('initializes when localStorage reads are unavailable', () => {
        vi.spyOn(localStorage, 'getItem').mockImplementation(() => { throw new Error('blocked'); });

        expect(() => initializeRetentionState({ currentLevel: 0, totalLevels: 55 })).not.toThrow();
    });

    it('derives progress from completions instead of the freely selected lesson', () => {
        const empty = getRetentionViewModel({ currentLevel: 54, completedLessons: 0, totalLevels: 55 });
        expect(empty.hasProgress).toBe(false);
        expect(empty.continueLearning).toBeNull();

        const started = getRetentionViewModel({ currentLevel: 54, completedLessons: 11, totalLevels: 55 });
        expect(started.continueLearning.progressPercent).toBe(20);
    });

    it('labels a custom lesson without an invalid bundled lesson fraction', () => {
        localStorage.clear();
        const summary = {
            currentLevel: 55,
            currentLessonIsCustom: true,
            completedLessons: 11,
            totalLevels: 55
        };
        initializeRetentionState(summary, 'Imported lesson', 'w');

        const view = getRetentionViewModel(summary, 'Imported lesson', 'w');

        expect(view.continueLearning.lessonLabel).toBe('My lessons');
        expect(view.lastSession.lessonLabel).toBe('My lessons');
    });
});
