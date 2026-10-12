/**
 * Regression ID: TD-0001
 * 
 * Issue: Progress validation off-by-one destroys saves.
 * 
 * Original Cause: The progress validator hardcoded the max level index to 14, 
 * while the game had 16 levels. A user completing the game got their save marked 
 * invalid on load, and `autoLoadProgress` permanently deleted invalid saves.
 * 
 * User Impact: Users who beat the game lost all their progress upon refreshing the page.
 * 
 * Fixed In: PM-0001
 * 
 * Test Strategy: 
 * 1. Verify that a valid save (completed game, currentLevel = 15) is loaded successfully.
 * 2. Verify that an invalid save (corrupted) is NOT deleted from storage, but rather 
 * kept/backed up, ensuring user data is never destroyed automatically.
 * 
 * Never Break Again: We derive level count dynamically from the levels array and never
 * destructively wipe user data during auto-load validation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadFixture } from '../helpers/fixtures.js';
import { setupMockStorage } from '../helpers/mock-storage.js';
import { progressSystem } from '../../js/storage/progress-system.js';

describe('Regression: TD-0001 Save Corruption', () => {
    let mockStorage;
    let originalConsoleWarn;

    beforeEach(() => {
        // Setup mock localStorage
        mockStorage = setupMockStorage();
        
        // Suppress warnings for clean test output
        originalConsoleWarn = console.warn;
        console.warn = vi.fn();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
        mockStorage.clear();
        vi.restoreAllMocks();
    });

    it('should successfully load a valid completed game save', () => {
        const completedSave = loadFixture('saves', 'completed-game.json');
        
        // Mock the application state setters that applyProgressData calls
        vi.spyOn(progressSystem, 'applyProgressData').mockImplementation(() => {});

        mockStorage.setItem(progressSystem.storageKey, JSON.stringify(completedSave));
        
        const result = progressSystem.autoLoadProgress();
        
        expect(result.loaded).toBe(true);
        expect(mockStorage.getItem(progressSystem.storageKey)).not.toBeNull();
        expect(progressSystem.applyProgressData).toHaveBeenCalled();
    });

    it('removes obsolete fields when loading valid progress', () => {
        const save = { ...loadFixture('saves', 'completed-game.json'), obsoleteCounter: 420 };
        mockStorage.setItem(progressSystem.storageKey, JSON.stringify(save));

        expect(progressSystem.autoLoadProgress()).toMatchObject({ loaded: true, repaired: true, persisted: true });
        expect(JSON.parse(mockStorage.getItem(progressSystem.storageKey))).not.toHaveProperty('obsoleteCounter');
        expect(JSON.parse(mockStorage.getItem(progressSystem.backupKey)).raw).toBe(JSON.stringify(save));
    });

    it('does not persist unknown fields from imported progress', () => {
        const save = { ...loadFixture('saves', 'completed-game.json'), obsoleteCounter: 420 };
        const code = `${progressSystem.exportPrefix}${btoa(JSON.stringify(save))}`;

        expect(progressSystem.importProgress(code).success).toBe(true);
        expect(JSON.parse(mockStorage.getItem(progressSystem.storageKey))).not.toHaveProperty('obsoleteCounter');
    });

    it('does not overwrite obsolete fields when their backup fails', () => {
        const save = { ...loadFixture('saves', 'completed-game.json'), obsoleteCounter: 420 };
        const raw = JSON.stringify(save);
        mockStorage.setItem(progressSystem.storageKey, raw);
        const setItem = mockStorage.setItem.bind(mockStorage);
        vi.spyOn(mockStorage, 'setItem').mockImplementation((key, value) => {
            if (key === progressSystem.backupKey) throw new Error('storage full');
            setItem(key, value);
        });

        expect(progressSystem.autoLoadProgress()).toMatchObject({
            loaded: true,
            repaired: true,
            persisted: false,
            backupKept: false
        });
        expect(progressSystem.autoSaveProgress()).toBe(false);
        expect(mockStorage.getItem(progressSystem.storageKey)).toBe(raw);
    });

    it('resumes autosave after the pending backup succeeds', () => {
        const save = { ...loadFixture('saves', 'completed-game.json'), obsoleteCounter: 420 };
        const raw = JSON.stringify(save);
        mockStorage.setItem(progressSystem.storageKey, raw);
        const setItem = mockStorage.setItem.bind(mockStorage);
        let backupAttempts = 0;
        vi.spyOn(mockStorage, 'setItem').mockImplementation((key, value) => {
            if (key === progressSystem.backupKey && backupAttempts++ === 0) throw new Error('storage full');
            setItem(key, value);
        });

        expect(progressSystem.autoLoadProgress()).toMatchObject({ persisted: false, backupKept: false });
        expect(progressSystem.autoSaveProgress()).toBe(true);
        expect(JSON.parse(mockStorage.getItem(progressSystem.backupKey)).raw).toBe(raw);
        expect(JSON.parse(mockStorage.getItem(progressSystem.storageKey))).not.toHaveProperty('obsoleteCounter');
    });

    it('should attempt to repair a corrupted save and back up the original', () => {
        const corruptedSave = loadFixture('saves', 'corrupted-save.json');
        const rawJson = JSON.stringify(corruptedSave);
        
        mockStorage.setItem(progressSystem.storageKey, rawJson);
        
        const result = progressSystem.autoLoadProgress();
        
        // It should repair and load
        expect(result.loaded).toBe(true);
        expect(result.repaired).toBe(true);
        
        // The original corrupted data must be preserved in backup
        const backupDataRaw = mockStorage.getItem(progressSystem.backupKey);
        const backupData = JSON.parse(backupDataRaw);
        expect(backupData.raw).toBe(rawJson);
    });

    it('should NOT delete an unparseable save from storage', () => {
        const unparseable = "{ this is not valid json ]";
        mockStorage.setItem(progressSystem.storageKey, unparseable);
        
        const result = progressSystem.autoLoadProgress();
        
        expect(result.loaded).toBe(false);
        expect(mockStorage.getItem(progressSystem.storageKey)).toBe(unparseable);
    });

    it('blocks autosave when an unparseable save cannot be backed up', () => {
        const unparseable = '{ broken';
        mockStorage.setItem(progressSystem.storageKey, unparseable);
        const setItem = mockStorage.setItem.bind(mockStorage);
        vi.spyOn(mockStorage, 'setItem').mockImplementation((key, value) => {
            if (key === progressSystem.backupKey) throw new Error('storage full');
            setItem(key, value);
        });

        expect(progressSystem.autoLoadProgress()).toMatchObject({ loaded: false, backupKept: false });
        expect(progressSystem.autoSaveProgress()).toBe(false);
        expect(mockStorage.getItem(progressSystem.storageKey)).toBe(unparseable);
    });

    it('repairs a legacy save without completed lesson IDs', () => {
        const legacySave = {
            version: '1.0',
            timestamp: Date.now(),
            badges: [],
            practicedCommands: [],
            currentLevel: 2,
            challengeMode: false,
            xp: 30,
            combo: 1
        };
        mockStorage.setItem(progressSystem.storageKey, JSON.stringify(legacySave));

        const result = progressSystem.autoLoadProgress();

        expect(result).toMatchObject({ loaded: true, repaired: true });
        expect(JSON.parse(mockStorage.getItem(progressSystem.storageKey)).completedLessonIds).toEqual([]);
    });

    it.each([
        ['challengeMode', 'yes'],
        ['xp', '30'],
        ['combo', '2'],
        ['timestamp', 'yesterday'],
        ['badges', [{}]],
        ['practicedCommands', [42]],
        ['xp', 2.5],
        ['combo', 3.5]
    ])('rejects an invalid %s value during import', (field, value) => {
        const save = loadFixture('saves', 'completed-game.json');

        expect(progressSystem.validateProgressData({ ...save, [field]: value })).toMatchObject({ valid: false });
    });

    it('does not apply an imported save when persistence fails', () => {
        const save = loadFixture('saves', 'completed-game.json');
        const code = `${progressSystem.exportPrefix}${btoa(JSON.stringify(save))}`;
        const apply = vi.spyOn(progressSystem, 'applyProgressData');
        vi.spyOn(mockStorage, 'setItem').mockImplementation(() => { throw new Error('storage full'); });

        expect(progressSystem.importProgress(code)).toMatchObject({ success: false });
        expect(apply).not.toHaveBeenCalled();
    });

    it('repairs negative progress counters by clamping them to zero', () => {
        const save = loadFixture('saves', 'completed-game.json');
        const repaired = progressSystem.repairProgressData({
            ...save,
            obsoleteCounter: 420,
            xp: -2,
            combo: -3
        });

        expect(repaired).not.toHaveProperty('obsoleteCounter');
        expect(repaired).toMatchObject({ xp: 0, combo: 0 });
    });

    it('leaves saves from a newer schema untouched', () => {
        const save = { ...loadFixture('saves', 'completed-game.json'), version: '2.0' };
        const raw = JSON.stringify(save);
        mockStorage.setItem(progressSystem.storageKey, raw);

        expect(progressSystem.autoLoadProgress()).toMatchObject({ loaded: false, repaired: false });
        expect(mockStorage.getItem(progressSystem.storageKey)).toBe(raw);
    });

    it('reports when a repaired save cannot be persisted', () => {
        const save = loadFixture('saves', 'corrupted-save.json');
        mockStorage.setItem(progressSystem.storageKey, JSON.stringify(save));
        const setItem = mockStorage.setItem.bind(mockStorage);
        vi.spyOn(mockStorage, 'setItem').mockImplementation((key, value) => {
            if (key === progressSystem.storageKey) throw new Error('storage full');
            setItem(key, value);
        });

        expect(progressSystem.autoLoadProgress()).toMatchObject({
            loaded: true,
            repaired: true,
            persisted: false,
            backupKept: true
        });
    });

    it('reports when the original backup cannot be created during repair', () => {
        const save = loadFixture('saves', 'corrupted-save.json');
        mockStorage.setItem(progressSystem.storageKey, JSON.stringify(save));
        const setItem = mockStorage.setItem.bind(mockStorage);
        vi.spyOn(mockStorage, 'setItem').mockImplementation((key, value) => {
            if (key === progressSystem.backupKey) throw new Error('storage full');
            setItem(key, value);
        });

        expect(progressSystem.autoLoadProgress()).toMatchObject({
            loaded: true,
            repaired: true,
            persisted: false,
            backupKept: false
        });
        expect(progressSystem.autoSaveProgress()).toBe(false);
        expect(mockStorage.getItem(progressSystem.storageKey)).toBe(JSON.stringify(save));
    });
});
