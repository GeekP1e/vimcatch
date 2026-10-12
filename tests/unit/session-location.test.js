import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as state from '../../js/core/game-state.js';
import { levels, loadLevel } from '../../js/lessons/levels.js';
import { configurePractice } from '../../js/practice/challenges.js';
import { readSessionLocation, saveSessionLocation } from '../../js/storage/session-location.js';
import { restoreSessionLocation, restartPracticeSession, selectGolfTask, startPracticeTimer, toggleChallengeMode, updateUI } from '../../js/ui/event-handlers.js';
import { initializeDOMReferences } from '../../js/ui/ui-components.js';

describe('saved session location', () => {
    const reset = () => {
        state.resetGameState();
        state.resetChallengeState();
        state.setChallengeMode(false);
    };

    beforeEach(() => {
        localStorage.clear();
        reset();
        configurePractice({ mode: 'time', duration: 60 });
        document.body.innerHTML = '<div id="challenge-container"></div><div id="vim-editor-display"></div><div id="practice-mode"><button data-practice-mode="time"></button><button data-practice-mode="golf"></button></div><div id="practice-duration-wrap"><select id="practice-duration"><option value="30">30</option><option value="60">60</option><option value="600">600</option><option value="900">900</option></select></div>';
        initializeDOMReferences();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        reset();
        vi.useRealTimers();
    });

    it('restores the training tab and lesson by stable ID', () => {
        loadLevel(8);
        saveSessionLocation();
        expect(readSessionLocation()).toMatchObject({ tab: 'train', lessonId: levels[8].id });
        reset();
        restoreSessionLocation();
        expect(state.getCurrentLevel()).toBe(8);
        expect(state.getChallengeMode()).toBe(false);
    });

    it('restores the practice tab and selected golf task after reload', () => {
        restartPracticeSession({ mode: 'golf', duration: 60 });
        selectGolfTask(6);
        const id = state.getCurrentChallenge().tasks[6].id;
        expect(readSessionLocation()).toMatchObject({ tab: 'practice', practiceMode: 'golf', golfTaskId: id });
        reset();
        restoreSessionLocation();
        expect(state.getChallengeMode()).toBe(true);
        expect(state.getCurrentChallenge().mode).toBe('golf');
        expect(state.getCurrentTaskIndex()).toBe(6);
        expect(state.getContent()).toEqual(state.getCurrentChallenge().tasks[6].initialContent);
        expect(document.querySelector('[data-practice-mode="golf"]').getAttribute('aria-pressed')).toBe('true');
        expect(document.getElementById('practice-duration-wrap').classList.contains('hidden')).toBe(true);
    });

    it('restores practice when progress loaded only the challenge mode flag', () => {
        restartPracticeSession({ mode: 'golf', duration: 60 });
        selectGolfTask(3);
        const saved = readSessionLocation();
        reset();
        state.setChallengeMode(true);

        restoreSessionLocation(saved);

        expect(state.getChallengeMode()).toBe(true);
        expect(state.getCurrentChallenge()?.mode).toBe('golf');
        expect(state.getCurrentTaskIndex()).toBe(3);
    });

    it('remembers golf selection when switching modes or visiting training', () => {
        restartPracticeSession({ mode: 'golf', duration: 60 });
        selectGolfTask(4);
        restartPracticeSession({ mode: 'time', duration: 60 });
        restartPracticeSession({ mode: 'golf', duration: 60 });
        expect(state.getCurrentTaskIndex()).toBe(4);
        toggleChallengeMode();
        expect(readSessionLocation().tab).toBe('train');
        toggleChallengeMode();
        expect(state.getCurrentTaskIndex()).toBe(4);
    });

    it('restores timed task order, index, score and duration without starting the timer', () => {
        restartPracticeSession({ mode: 'time', duration: 30 });
        const ids = state.getCurrentChallenge().tasks.map(task => task.id);
        state.setCurrentTaskIndex(5);
        state.setChallengeProgressValue(5);
        state.setChallengeScoreValue(65);
        updateUI();
        reset();
        restoreSessionLocation();
        expect(state.getCurrentChallenge().tasks.map(task => task.id)).toEqual(ids);
        expect(state.getCurrentTaskIndex()).toBe(5);
        expect(state.getChallengeScoreValue()).toBe(65);
        expect(state.getChallengeProgressValue()).toBe(5);
        expect(state.getChallengeTimerInterval()).toBeNull();
        expect(document.getElementById('practice-duration').value).toBe('30');
    });

    it('restores the remaining time from the saved deadline', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
        restartPracticeSession({ mode: 'time', duration: 30 });
        startPracticeTimer();
        vi.advanceTimersByTime(12_000);
        saveSessionLocation();

        reset();
        restoreSessionLocation();
        expect(state.getChallengeStartTime()).toBe(Date.now() - 12_000);

        expect(state.getChallengeTimerInterval()).not.toBeNull();
        expect(startPracticeTimer()).toBe(false);
        vi.advanceTimersByTime(18_000);
        expect(state.getCurrentChallenge().finished).toBe(true);
    });

    it('rejects a deadline beyond the configured duration', () => {
        restartPracticeSession({ mode: 'time', duration: 30 });
        saveSessionLocation();
        const saved = JSON.parse(localStorage.getItem('vimcatch-session-location-v1'));
        saved.time.deadline = Date.now() + 31_000;
        localStorage.setItem('vimcatch-session-location-v1', JSON.stringify(saved));

        expect(readSessionLocation().time).toBeUndefined();
    });

    it('rejects a saved task list with changed ID counts', () => {
        restartPracticeSession({ mode: 'time', duration: 30 });
        saveSessionLocation();
        const saved = JSON.parse(localStorage.getItem('vimcatch-session-location-v1'));
        saved.time.taskIds.fill(saved.time.taskIds[0]);
        localStorage.setItem('vimcatch-session-location-v1', JSON.stringify(saved));

        reset();
        restoreSessionLocation();

        expect(state.getCurrentTaskIndex()).toBe(0);
        expect(state.getChallengeScoreValue()).toBe(0);
    });

    it('rejects progress that is inconsistent with the task index', () => {
        restartPracticeSession({ mode: 'time', duration: 30 });
        saveSessionLocation();
        const saved = JSON.parse(localStorage.getItem('vimcatch-session-location-v1'));
        saved.time.progress = saved.time.taskIds.length;
        localStorage.setItem('vimcatch-session-location-v1', JSON.stringify(saved));

        expect(readSessionLocation().time).toBeUndefined();
    });

    it('supports legacy timed saves without an explicit progress value', () => {
        restartPracticeSession({ mode: 'time', duration: 30 });
        state.setCurrentTaskIndex(5);
        saveSessionLocation();
        const saved = JSON.parse(localStorage.getItem('vimcatch-session-location-v1'));
        delete saved.time.progress;
        localStorage.setItem('vimcatch-session-location-v1', JSON.stringify(saved));

        expect(readSessionLocation().time.progress).toBe(5);
    });

    it('restores a finished timed session without restarting it', () => {
        restartPracticeSession({ mode: 'time', duration: 30 });
        state.setCurrentChallenge({ ...state.getCurrentChallenge(), finished: true });
        saveSessionLocation();

        reset();
        restoreSessionLocation();

        expect(state.getCurrentChallenge().finished).toBe(true);
        expect(startPracticeTimer()).toBe(false);
    });

    it.each([600, 900])('persists a %i-second practice duration', duration => {
        configurePractice({ mode: 'time', duration });
        saveSessionLocation();
        expect(readSessionLocation().duration).toBe(duration);
    });

    it.each([600, 900])('restores task position and score for a %i-second session', duration => {
        restartPracticeSession({ mode: 'time', duration });
        const ids = state.getCurrentChallenge().tasks.map(task => task.id);
        const index = duration - 1;
        state.setCurrentTaskIndex(index);
        state.setChallengeProgressValue(index);
        state.setChallengeScoreValue(321);
        updateUI();

        reset();
        restoreSessionLocation();

        expect(state.getCurrentChallenge().tasks.map(task => task.id)).toEqual(ids);
        expect(state.getCurrentTaskIndex()).toBe(index);
        expect(state.getChallengeProgressValue()).toBe(index);
        expect(state.getChallengeScoreValue()).toBe(321);
    });

    it('still starts a fresh timed session when Start over is requested', () => {
        restartPracticeSession({ mode: 'time', duration: 30 });
        state.setCurrentTaskIndex(5);
        updateUI();
        restartPracticeSession({ mode: 'time', duration: 30 });
        expect(state.getCurrentTaskIndex()).toBe(0);
        expect(state.getChallengeProgressValue()).toBe(0);
    });

    it('clears the timed practice interval immediately when leaving practice', () => {
        vi.useFakeTimers();
        restartPracticeSession({ mode: 'time', duration: 30 });
        startPracticeTimer();
        const timer = state.getChallengeTimerInterval();
        const clear = vi.spyOn(globalThis, 'clearInterval');

        toggleChallengeMode();

        expect(clear).toHaveBeenCalledWith(timer);
        expect(state.getChallengeTimerInterval()).toBeNull();
    });

    it('fully resets a completed challenge when returning to training', async () => {
        state.setChallengeMode(true);
        state.setCurrentChallenge({ mode: 'golf', tasks: [], finished: true });
        await import('../../js/main.js');

        window.returnToLevel();

        expect(state.getChallengeMode()).toBe(false);
        expect(state.getCurrentChallenge()).toBeNull();
        expect(document.getElementById('challenge-container').classList.contains('hidden')).toBe(true);
    });

    it('does not advance a lesson when Enter is pressed for a challenge modal', async () => {
        loadLevel(4);
        state.setChallengeMode(true);
        state.setCurrentChallenge({ mode: 'time', tasks: [], finished: true });
        const { handleVisibleModalEnter } = await import('../../js/main.js');

        expect(handleVisibleModalEnter(document.createElement('textarea'))).toBe(false);
        expect(state.getCurrentLevel()).toBe(4);
        expect(state.getCurrentChallenge()?.finished).toBe(true);
    });

    it('falls back safely when a saved golf task no longer exists', () => {
        restartPracticeSession({ mode: 'golf', duration: 60 });
        const saved = readSessionLocation();
        reset();
        localStorage.setItem('vimcatch-session-location-v1', JSON.stringify({ ...saved, golfTaskId: 'retired-puzzle' }));
        restoreSessionLocation();
        expect(state.getCurrentTaskIndex()).toBe(0);
        expect(state.getCurrentChallenge().mode).toBe('golf');
    });

    it('avoids redundant writes when only the cursor changes', () => {
        saveSessionLocation();
        const write = vi.spyOn(localStorage, 'setItem');
        state.setCursor({ row: 0, col: 1 });
        saveSessionLocation();
        expect(write).not.toHaveBeenCalled();
    });

    it('ignores malformed saves and remains usable without storage', () => {
        localStorage.setItem('vimcatch-session-location-v1', '{broken');
        expect(readSessionLocation()).toBeNull();
        expect(() => restoreSessionLocation()).not.toThrow();
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('storage full'); });
        expect(() => saveSessionLocation()).not.toThrow();
    });
});
