// VimCatch Game - Progress Save/Load System

import {
    getBadges, getPracticedCommands, getCurrentLevel, getChallengeMode,
    getXp, getCombo, setBadges,
    setPracticedCommands, setCurrentLevel, setChallengeMode,
    setXp, setCombo, getCompletedLessonIds, setCompletedLessonIds, resetChallengeState
} from '../core/game-state.js';

import { bundledLessonIds, levels } from '../lessons/levels.js';
import { logger, CATEGORIES } from '../utils/logger.js';

// Progress System Class
class ProgressSystem {
    constructor() {
        this.version = '1.0';
        this.exportPrefix = 'VIM_MASTER_PROGRESS_';
        this.storageKey = 'vimMasterProgress';
        this.backupKey = 'vimMasterProgressBackup';
        this.pendingProgressBackup = null;
    }

    normalizeProgressData(data) {
        return {
            version: data.version,
            timestamp: data.timestamp,
            badges: [...data.badges],
            practicedCommands: [...data.practicedCommands],
            currentLevel: data.currentLevel,
            completedLessonIds: [...data.completedLessonIds],
            challengeMode: data.challengeMode,
            xp: data.xp,
            combo: data.combo
        };
    }

    /**
     * Export user progress as a compact code
     * @returns {string} Base64 encoded progress data
     */
    exportProgress() {
        try {
            // Collect all progress data
            const progressData = {
                version: this.version,
                timestamp: Date.now(),
                badges: Array.from(getBadges()),
                practicedCommands: Array.from(getPracticedCommands()),
                currentLevel: getCurrentLevel(),
                completedLessonIds: Array.from(getCompletedLessonIds()),
                challengeMode: getChallengeMode(),
                xp: getXp(),
                combo: getCombo()
            };

            // Convert to JSON and encode
            const jsonString = JSON.stringify(progressData);
            const base64String = btoa(jsonString);
            
            // Add prefix for easy identification
            return this.exportPrefix + base64String;
        } catch (error) {
            logger.error(CATEGORIES.PROGRESS, 'Export failed', { error: error.message });
            throw new Error('Failed to export progress data');
        }
    }

    /**
     * Import user progress from a code
     * @param {string} importCode - The progress code to import
     * @returns {Object} Import result with success status and message
     */
    importProgress(importCode) {
        try {
            // Validate import code format
            if (!importCode || typeof importCode !== 'string') {
                return { success: false, message: 'Invalid import code format' };
            }

            // Remove prefix if present
            let code = importCode;
            if (importCode.startsWith(this.exportPrefix)) {
                code = importCode.substring(this.exportPrefix.length);
            }

            // Decode base64
            let jsonString;
            try {
                jsonString = atob(code);
            } catch {
                return { success: false, message: 'Invalid import code encoding' };
            }

            // Parse JSON
            let progressData;
            try {
                progressData = JSON.parse(jsonString);
            } catch {
                return { success: false, message: 'Invalid import code data' };
            }

            // Validate data structure
            const validation = this.validateProgressData(progressData);
            if (!validation.valid) {
                return { success: false, message: validation.message };
            }

            const normalized = this.normalizeProgressData(progressData);
            // Persist before mutating runtime state so an import is atomic.
            if (!this.saveToLocalStorage(normalized)) {
                return { success: false, message: 'Failed to save imported progress data' };
            }
            this.applyProgressData(normalized);

            return { 
                success: true, 
                message: `Progress imported successfully! Level ${progressData.currentLevel + 1}, ${progressData.badges.length} badges, ${progressData.practicedCommands.length} commands practiced.` 
            };

        } catch (error) {
            logger.error(CATEGORIES.PROGRESS, 'Import failed', { error: error.message });
            return { success: false, message: 'Failed to import progress data' };
        }
    }

    /**
     * Validate imported progress data
     * @param {Object} data - Progress data to validate
     * @returns {Object} Validation result
     */
    validateProgressData(data) {
        // Check required fields
        if (!data || typeof data !== 'object' || Array.isArray(data)
            || !data.version || data.timestamp === undefined || !data.badges
            || !data.practicedCommands || data.currentLevel === undefined) {
            return { valid: false, message: 'Invalid progress data structure' };
        }
        
        if (data.xp === undefined) data.xp = 0;
        if (data.combo === undefined) data.combo = 0;
        if (data.challengeMode === undefined) data.challengeMode = false;

        // Check version compatibility
        if (data.version !== this.version) {
            return { valid: false, message: `Version mismatch. Expected ${this.version}, got ${data.version}` };
        }

        // Check data types
        if (!Number.isFinite(data.timestamp) || data.timestamp < 0
            || !Array.isArray(data.badges) || data.badges.some((badge) => typeof badge !== 'string')
            || !Array.isArray(data.practicedCommands)
            || data.practicedCommands.some((command) => typeof command !== 'string')) {
            return { valid: false, message: 'Invalid data types in progress data' };
        }

        if (typeof data.challengeMode !== 'boolean'
            || !Number.isInteger(data.xp) || data.xp < 0
            || !Number.isInteger(data.combo) || data.combo < 0) {
            return { valid: false, message: 'Invalid progress values' };
        }

        // Check level range (always derived from the levels data — never hardcoded)
        if (!Number.isInteger(data.currentLevel) || data.currentLevel < 0 || data.currentLevel >= levels.length) {
            return { valid: false, message: 'Invalid level number in progress data' };
        }

        if (!Array.isArray(data.completedLessonIds) || data.completedLessonIds.some((id) => typeof id !== 'string')) {
            return { valid: false, message: 'Invalid completed lessons in progress data' };
        }

        return { valid: true };
    }

    /**
     * Attempt to repair invalid progress data instead of rejecting it.
     * User data is never destroyed automatically.
     * @param {Object} data - Possibly-invalid progress data
     * @returns {Object|null} A valid progress object, or null if unrepairable
     */
    repairProgressData(data) {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            return null;
        }

        // Only the current schema has defined repair rules. Unknown versions may
        // belong to a newer application and must remain untouched.
        if (data.version !== undefined && data.version !== this.version) return null;

        const repaired = { ...data };

        // Best-effort migration: normalize to the current version after
        // defaulting any fields that version didn't have
        repaired.version = this.version;
        if (!Number.isFinite(repaired.timestamp) || repaired.timestamp < 0) repaired.timestamp = Date.now();
        repaired.badges = Array.isArray(repaired.badges)
            ? repaired.badges.filter((badge) => typeof badge === 'string') : [];
        repaired.practicedCommands = Array.isArray(repaired.practicedCommands)
            ? repaired.practicedCommands.filter((command) => typeof command === 'string') : [];
        if (typeof repaired.challengeMode !== 'boolean') repaired.challengeMode = false;
        repaired.xp = typeof repaired.xp === 'number' && Number.isFinite(repaired.xp)
            ? Math.max(0, Math.trunc(repaired.xp)) : 0;
        repaired.combo = typeof repaired.combo === 'number' && Number.isFinite(repaired.combo)
            ? Math.max(0, Math.trunc(repaired.combo)) : 0;

        // Clamp the level into the valid range instead of rejecting it
        const level = Number(repaired.currentLevel);
        repaired.currentLevel = Number.isFinite(level)
            ? Math.min(Math.max(Math.trunc(level), 0), levels.length - 1)
            : 0;

        repaired.completedLessonIds = Array.isArray(repaired.completedLessonIds)
            ? repaired.completedLessonIds.filter((id) => typeof id === 'string')
            : [];

        return this.validateProgressData(repaired).valid ? this.normalizeProgressData(repaired) : null;
    }

    /**
     * Preserve the original (raw) save before it can be overwritten.
     * @param {string} raw - The raw string found in storage
     * @param {string} reason - Why the backup was made
     */
    backupProgress(raw, reason) {
        try {
            localStorage.setItem(this.backupKey, JSON.stringify({
                backedUpAt: Date.now(),
                reason,
                raw
            }));
            return true;
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Failed to back up progress data', { error: error.message });
            return false;
        }
    }

    ensurePendingProgressBackup() {
        if (!this.pendingProgressBackup) return true;
        const { raw, reason } = this.pendingProgressBackup;
        if (!this.backupProgress(raw, reason)) return false;
        this.pendingProgressBackup = null;
        return true;
    }

    /**
     * Apply imported progress data to game state
     * @param {Object} data - Validated progress data
     */
    applyProgressData(data) {
        
        // Apply badges
        setBadges(data.badges);

        // Apply practiced commands
        const practicedSet = new Set(data.practicedCommands);
        setPracticedCommands(practicedSet);

        // Apply current level
        setCurrentLevel(data.currentLevel);
        setCompletedLessonIds(data.completedLessonIds);

        // Apply challenge mode
        setChallengeMode(data.challengeMode);
        
        // Apply XP and Combo
        setXp(data.xp || 0);
        setCombo(data.combo || 0);
        
    }

    /**
     * Save progress data to localStorage
     * @param {Object} data - Progress data to save
     * @returns {boolean} Whether the data was persisted
     */
    saveToLocalStorage(data) {
        try {
            if (!this.ensurePendingProgressBackup()) return false;
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Failed to save progress to localStorage', { error: error.message });
            return false;
        }
    }

    /**
     * Load progress from localStorage
     * @returns {Object|null} Progress data or null if not found
     */
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Failed to load progress from localStorage', { error: error.message });
        }
        return null;
    }

    /**
     * Auto-load progress on game start.
     *
     * Load → validate → if invalid, try repair → if repaired, continue;
     * otherwise keep the original save, create a backup, and notify the user.
     * A save is NEVER deleted here, no matter how corrupted (see PM-0001).
     *
     * @returns {{loaded: boolean, repaired: boolean, message: string|null}}
     */
    autoLoadProgress() {
        let raw = null;
        try {
            raw = localStorage.getItem(this.storageKey);
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Failed to access saved progress', { error: error.message });
            return { loaded: false, repaired: false, message: null };
        }

        if (!raw) {
            this.pendingProgressBackup = null;
            return { loaded: false, repaired: false, message: null };
        }
        if (this.pendingProgressBackup?.raw !== raw) this.pendingProgressBackup = null;

        let stored = null;
        try {
            stored = JSON.parse(raw);
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Saved progress is not valid JSON', { error: error.message });
        }

        if (stored) {
            const validation = this.validateProgressData(stored);
            if (validation.valid) {
                const normalized = this.normalizeProgressData(stored);
                const changed = JSON.stringify(normalized) !== JSON.stringify(stored);
                if (changed) {
                    const backupReason = 'normalized obsolete progress fields';
                    const backupKept = this.backupProgress(raw, backupReason);
                    if (!backupKept) this.pendingProgressBackup = { raw, reason: backupReason };
                    const persisted = backupKept ? this.saveToLocalStorage(normalized) : false;
                    this.applyProgressData(normalized);
                    return {
                        loaded: true,
                        repaired: true,
                        persisted,
                        backupKept,
                        message: persisted
                            ? 'Your saved progress was updated to the current format.'
                            : backupKept
                                ? 'Your progress was updated for this session but could not be saved. A backup of the original was kept.'
                                : 'Your progress was updated for this session, but the original save was left untouched because a backup could not be created.'
                    };
                }
                this.applyProgressData(normalized);
                return { loaded: true, repaired: false, message: null };
            }

            const repaired = this.repairProgressData(stored);
            if (repaired) {
                const backupReason = `repaired: ${validation.message}`;
                const backupKept = this.backupProgress(raw, backupReason);
                if (!backupKept) this.pendingProgressBackup = { raw, reason: backupReason };
                const persisted = backupKept ? this.saveToLocalStorage(repaired) : false;
                this.applyProgressData(repaired);
                return {
                    loaded: true,
                    repaired: true,
                    persisted,
                    backupKept,
                    message: persisted
                        ? 'Your saved progress was automatically repaired. A backup of the original was kept.'
                        : backupKept
                            ? 'Your progress was repaired for this session but could not be saved. A backup of the original was kept.'
                            : 'Your progress was repaired for this session, but the original save was left untouched because a backup could not be created.'
                };
            }
        }

        // Unrepairable: keep the original save untouched, back it up, tell the user.
        const backupReason = 'unrepairable';
        const backupKept = this.backupProgress(raw, backupReason);
        if (!backupKept) this.pendingProgressBackup = { raw, reason: backupReason };
        return {
            loaded: false,
            repaired: false,
            backupKept,
            message: backupKept
                ? 'Your saved progress could not be read. It was NOT deleted — a backup was kept in your browser.'
                : 'Your saved progress could not be read. It remains untouched, but a backup could not be created.'
        };
    }

    /**
     * Auto-save current progress
     */
    autoSaveProgress() {
        try {
            if (!this.ensurePendingProgressBackup()) return false;
            const currentProgress = {
                version: this.version,
                timestamp: Date.now(),
                badges: Array.from(getBadges()),
                practicedCommands: Array.from(getPracticedCommands()),
                currentLevel: getCurrentLevel(),
                completedLessonIds: Array.from(getCompletedLessonIds()),
                challengeMode: getChallengeMode(),
                xp: getXp(),
                combo: getCombo()
            };
            return this.saveToLocalStorage(currentProgress);
        } catch (error) {
            logger.warn(CATEGORIES.PROGRESS, 'Auto-save failed', { error: error.message });
            return false;
        }
    }

    /**
     * Clear all saved progress. This is only ever called from an explicit,
     * user-confirmed action — even then, the save is backed up first.
     */
    clearProgress() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw && !this.backupProgress(raw, 'user-initiated clear')) {
                return { success: false, message: 'Failed to back up progress before clearing' };
            }
            localStorage.removeItem(this.storageKey);
            this.pendingProgressBackup = null;
            
            // Clear the game state using statically imported functions
            try {
                setBadges([]);
                setPracticedCommands([]);
                setCurrentLevel(0);
                setCompletedLessonIds([]);
                setXp(0);
                setCombo(0);
                resetChallengeState();
                setChallengeMode(false);
            } catch (error) {
                logger.warn(CATEGORIES.PROGRESS, 'Failed to clear game state', { error: error.message });
            }
            
            return { success: true, message: 'Progress cleared successfully' };
        } catch {
            return { success: false, message: 'Failed to clear progress' };
        }
    }

    /**
     * Get progress summary for display
     * @returns {Object} Progress summary
     */
    getProgressSummary() {
        const currentLessonId = levels[getCurrentLevel()]?.id;
        const result = {
            currentLevel: getCurrentLevel(),
            currentLessonIsCustom: Boolean(currentLessonId && !bundledLessonIds.has(currentLessonId)),
            completedLessons: [...bundledLessonIds].filter((id) => getCompletedLessonIds().has(id)).length,
            totalLevels: bundledLessonIds.size,
            badgesEarned: getBadges().size,
            commandsPracticed: getPracticedCommands().size,
            lastSaved: this.getLastSavedTime()
        };
        
        return result;
    }

    /**
     * Get last saved time
     * @returns {string} Formatted time string
     */
    getLastSavedTime() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                return new Date(data.timestamp).toLocaleString();
            }
        } catch (error) {
            logger.warn(CATEGORIES.STORAGE, 'Failed to get last saved time', { error: error.message });
        }
        return 'Never';
    }
}

// Create and export singleton instance
export const progressSystem = new ProgressSystem();

export const autoLoadProgress = () => progressSystem.autoLoadProgress();
export const autoSaveProgress = () => progressSystem.autoSaveProgress();
export const clearProgress = () => progressSystem.clearProgress();
export const getProgressSummary = () => progressSystem.getProgressSummary();
