import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { progressSystem } from '../../js/storage/progress-system.js';
import {
    setCurrentLevel, getCurrentLevel, setCompletedLessonIds, getCompletedLessonIds,
    setXp, getXp, setCombo, getCombo, setBadges, getBadges,
    setChallengeMode, getChallengeMode
} from '../../js/core/game-state.js';

describe('reset progress', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());


    it('resets completion, rewards and practice while preserving language and a backup', () => {
        localStorage.setItem(progressSystem.storageKey, '{"currentLevel":5}');
        localStorage.setItem('vimcatchLanguage', 'ru');
        setCurrentLevel(5);
        setCompletedLessonIds(['lesson-basic-movement']);
        setXp(90);
        setCombo(3);
        setBadges(['beginner']);
        setChallengeMode(true);

        expect(progressSystem.clearProgress().success).toBe(true);
        expect(localStorage.getItem(progressSystem.storageKey)).toBeNull();
        expect(JSON.parse(localStorage.getItem(progressSystem.backupKey)).raw).toBe('{"currentLevel":5}');
        expect(localStorage.getItem('vimcatchLanguage')).toBe('ru');
        expect(getCurrentLevel()).toBe(0);
        expect(getCompletedLessonIds().size).toBe(0);
        expect(getBadges().size).toBe(0);
        expect(getXp()).toBe(0);
        expect(getCombo()).toBe(0);
        expect(getChallengeMode()).toBe(false);
    });

    it('does not clear progress when the backup cannot be created', () => {
        const raw = '{"currentLevel":5}';
        localStorage.setItem(progressSystem.storageKey, raw);
        setCurrentLevel(5);
        const setItem = localStorage.setItem.bind(localStorage);
        vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
            if (key === progressSystem.backupKey) throw new Error('storage full');
            setItem(key, value);
        });

        expect(progressSystem.clearProgress().success).toBe(false);
        expect(localStorage.getItem(progressSystem.storageKey)).toBe(raw);
        expect(getCurrentLevel()).toBe(5);
    });
});
