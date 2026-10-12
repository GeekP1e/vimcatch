// VimCatch Game - Event Handlers

import {
    getContent, getCursor, getMode, getCurrentLevel,
    getCommandHistory, getCommandLog, getYankedLine, getReplacePending,
    getCountBuffer, getUndoStack, getRedoStack, getUsedUndo,
    getUsedRedoAfterUndo, getLastExCommand, getSearchMode, getSearchQuery,
    getLastSearchQuery, getLastSearchDirection, getSearchMatches, getCurrentMatchIndex,
    getUsedSearchInLevel, getNavCountSinceSearch, getBadges, getPracticedCommands,
    getChallengeMode, getCurrentChallenge, getChallengeTimerInterval, getChallengeStartTime,
    getChallengeScoreValue, getChallengeProgressValue, getCurrentTaskIndex, resetChallengeState,
    resetLevelState, setChallengeMode, setContent,
    setCursor, setMode, setLastExCommand, setCurrentChallenge,
    setCurrentTaskIndex, setChallengeScoreValue, setChallengeProgressValue, setChallengeStartTime,
    setChallengeTimerInterval, addBadge, getXp, getCombo,
    setXp, setCombo, markLessonCompleted, getCompletedLessonIds, getLevelSessionId
} from '../core/game-state.js';

import { bundledLessonIds, levels, loadLevel } from '../lessons/levels.js';
import {
    startChallenge, getChallengeTimeRemaining, calculateTaskPoints,
    configurePractice, getPracticeConfig, getPracticeMetrics,
    recordTaskCompletion, loadChallengeTask, resetPracticeMetrics, getGolfResult
} from '../practice/challenges.js';
import {
    renderEditor, updateStatusBar, updateInstructions, updateLevelIndicator,
    updateCommandLog, createLevelButtons, renderBadges, showModal, hideModal,
    flashLevelComplete, updateChallengeUI, showChallengeContainer,
    hideChallengeContainer, showBadgeToast, flashError, updateStatsBar,
    showEditorFeedback, updateSessionCommand, showCelebration
} from './ui-components.js';
import {
    noteMistake, noteLessonComplete, recordCompletionState
} from '../storage/retention-state.js';
import { autoSaveProgress } from '../storage/progress-system.js';
import { evaluateWinCondition } from '../lessons/win-evaluator.js';
import { logger, CATEGORIES } from '../utils/logger.js';
import { translateHint, t, practiceName } from '../utils/i18n.js';
import { readSessionLocation, saveSessionLocation } from '../storage/session-location.js';

// Game Logic Functions
let pendingCompletion = null;

export function checkWinCondition() {
    // Check challenge mode first
    if (getChallengeMode() && getCurrentChallenge()) {
        const challenge = getCurrentChallenge();
        if (challenge.finished || challenge.golfAttemptComplete) return;
        if (finishExpiredPractice(challenge)) return;
        const currentTask = challenge.tasks[getCurrentTaskIndex()];
        
        
        if (currentTask.validation) {
            // Create a gameState object for validation
            const gameState = {
                getContent: getContent,
                getCursor: getCursor,
                getYankedLine: getYankedLine,
                getMode: getMode
            };
            
            
            const validationResult = currentTask.validation(gameState);
            
            if (validationResult) {
                recordTaskCompletion(currentTask);
                if (challenge.mode === 'golf') {
                    const result = getGolfResult(currentTask.id);
                    const completed = challenge.tasks.filter(task => getGolfResult(task.id)).length;
                    setCurrentChallenge({ ...challenge, golfAttemptComplete: true });
                    setChallengeProgressValue(completed);
                    updateChallengeUI(getCurrentChallenge(), completed, 0, 0, getPracticeMetrics());
                    showEditorFeedback(`${t('golfSolved')}: ${result.last} ${t('golfKeys')} · ${t('golfBest')}: ${result.best}`, 'success', 5000);
                    return;
                }
                
                 // Award points via the single scoring source of truth (TD-6)
                 const taskPoints = calculateTaskPoints(challenge, getChallengeStartTime());
                 setChallengeScoreValue(getChallengeScoreValue() + taskPoints);
                
                // Move to next task or complete challenge
                                 if (getCurrentTaskIndex() < challenge.tasks.length - 1) {
                     // Next task
                     setCurrentTaskIndex(getCurrentTaskIndex() + 1);
                     setChallengeProgressValue(getChallengeProgressValue() + 1);
                     updateChallengeUI(
                         challenge,
                         getChallengeProgressValue(),
                         getChallengeScoreValue(),
                         getChallengeTimeRemaining({
                             currentChallenge: challenge,
                             challengeStartTime: getChallengeStartTime()
                         }),
                         getPracticeMetrics()
                     );
                     
                     // Manually update just the instructions for the new task
                     const nextTask = challenge.tasks[getCurrentTaskIndex()];
                     if (nextTask) {
                         loadChallengeTask(nextTask, { setContent, setCursor, setMode, resetLevelState });
                         updateUI();
                     }
                     
                     return; // Don't show win condition yet
                 } else {
                     // Challenge completed!
                     setChallengeProgressValue(getChallengeProgressValue() + 1);
                     setCurrentChallenge({ ...challenge, finished: true });
                     updateChallengeUI(
                         getCurrentChallenge(),
                         getChallengeProgressValue(),
                         getChallengeScoreValue(),
                         getChallengeTimeRemaining({
                             currentChallenge: challenge,
                             challengeStartTime: getChallengeStartTime()
                         }),
                         getPracticeMetrics()
                     );
                     
                     // Disable challenge mode to stop timer
                     if (getChallengeTimerInterval()) clearInterval(getChallengeTimerInterval());
                     setChallengeTimerInterval(null);
                     saveSessionLocation();
                     
                     // Debug modal elements
                     
                     // Show completion modal with option to play again
                     showModal(t('challengeComplete'),
                         `${t('challengeCompleteMessage').replace('{name}', practiceName(challenge))}<br><br>
                         <button onclick="window.startNewChallenge()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                             ${t('playAnotherChallenge')}
                         </button>
                         <button onclick="window.returnToLevel()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2">
                             ${t('returnToLevel')}
                         </button>`
                     );
                     
                     
                     return;
                 }
            }
        }
        return; // Don't check level win condition in challenge mode
    }
    
    // Regular level win condition check
    const completedLevelIndex = getCurrentLevel();
    const completedSessionId = getLevelSessionId();
    const level = levels[completedLevelIndex];
    const state = {
        lastExCommand: getLastExCommand(),
        cursor: getCursor(),
        usedSearchInLevel: getUsedSearchInLevel(),
        navCountSinceSearch: getNavCountSinceSearch(),
        lastSearchQuery: getLastSearchQuery(),
        lastSearchDirection: getLastSearchDirection(),
        content: getContent(),
        mode: getMode(),
        usedRedoAfterUndo: getUsedRedoAfterUndo()
    };

    const { won } = evaluateWinCondition(state, level);

    if (won) {
        if (pendingCompletion === completedSessionId) return;
        pendingCompletion = completedSessionId;
        flashLevelComplete();
        setTimeout(() => {
            if (pendingCompletion === completedSessionId) pendingCompletion = null;
            // A pending completion must never be applied to a newly selected lesson.
            if (getCurrentLevel() !== completedLevelIndex || getLevelSessionId() !== completedSessionId) return;
            markLessonCompleted(level.id);
            const completedLessonIds = getCompletedLessonIds();
            const courseComplete = [...bundledLessonIds].every((id) => completedLessonIds.has(id));
            maybeAwardBadges();
            
            // Calculate XP based on difficulty
            let earnedXp = 10;
            const diff = level.metadata && level.metadata.difficulty ? level.metadata.difficulty : 'beginner';
            if (diff === 'beginner') earnedXp = 15;
            else if (diff === 'intermediate') earnedXp = 25;
            else if (diff === 'advanced') earnedXp = 50;
            
            setXp(getXp() + earnedXp);
            setCombo(getCombo() + 1);
            noteLessonComplete({
                earnedXp,
                combo: getCombo(),
                progressSummary: {
                    currentLevel: getCurrentLevel(),
                    currentLessonIsCustom: !bundledLessonIds.has(level.id),
                    completedLessons: [...bundledLessonIds].filter((id) => completedLessonIds.has(id)).length,
                    totalLevels: bundledLessonIds.size,
                    badgesEarned: getBadges().size,
                    commandsPracticed: getPracticedCommands().size
                },
                lessonName: level.name,
                focusCommand: level.focusCommand ? level.focusCommand : (level.solution ? level.solution.join('') : ''),
                finalLevel: courseComplete
            });
            recordCompletionState(courseComplete);

            // Persist progress at the moment of completion (TD-3): the dead
            // window.checkWinCondition wrapper never ran, so wins relied on
            // the 30s interval save and could be lost on a quick tab close.
            try {
                autoSaveProgress();
                if (typeof window.updateProgressSummary === 'function') {
                    window.updateProgressSummary();
                }
            } catch (error) {
                logger.warn(CATEGORIES.PROGRESS, 'Failed to auto-save progress on level completion', { error: error.message });
            }

            if (courseComplete) {
                showCelebration();
                showEditorFeedback(translateHint('Course complete'), 'success', 3000);
            } else {
                nextLevel();
                showEditorFeedback(translateHint('Passed'), 'success', 1100);
            }
        }, 500);
    } else {
        // If an Ex command was just entered and failed to win
        if (state.lastExCommand) {
            const filename = state.lastExCommand.match(/^e\s+(.+)$/)?.[1];
            if (filename && level.files?.[filename]) {
                showEditorFeedback(t('openedFile').replace('{filename}', filename), 'success', 2500);
                setLastExCommand('');
                return;
            }
            flashError();
            showEditorFeedback(t('notQuite'), 'error');
            noteMistake();
            setCombo(0);
            updateStatsBar(0, getXp());
            setLastExCommand(''); // Reset it so it doesn't flash continuously
        }
    }
}

export function maybeAwardBadges() {
    let badgesAwarded = false;
    
    // Beginner: after finishing levels up to basic movement group (1-3)
    const completedLessonIds = getCompletedLessonIds();
    const completedBasics = levels.slice(0, 3).every((lesson) => completedLessonIds.has(lesson.id));
    if (!getBadges().has('beginner') && completedBasics) {
        // Add badge to game state
        addBadge('beginner');
        renderBadges(getBadges());
        showBadgeToast(t('beginnerEarned'));
        badgesAwarded = true;
    }
    // Search Master: after completing any of the search levels while using search
    const completedSearchRequirement = levels[getCurrentLevel()].requires?.some(requirement => requirement.type === 'search');
    if (!getBadges().has('searchmaster') && completedSearchRequirement && getUsedSearchInLevel()) {
        // Add badge to game state
        addBadge('searchmaster');
        renderBadges(getBadges());
        showBadgeToast(t('searchmasterEarned'));
        badgesAwarded = true;
    }
    
         // Auto-save progress if badges were awarded
     if (badgesAwarded) {
         // Use global progress system functions
         setTimeout(() => {
             try {
                 autoSaveProgress();
                 // Update progress summary display using the global updateProgressSummary function
                 if (typeof window.updateProgressSummary === 'function') {
                     window.updateProgressSummary();
                 }
             } catch {
                 // Progress system not available, continue without auto-save
             }
         }, 1000);
     }
}

// Level Management Functions
export function openTrainingLesson(levelIndex) {
    if (!loadLevel(levelIndex)) return false;
    resetChallengeState();
    hideChallengeContainer();
    updateUI();
    return true;
}

export function navigateToLevel(levelIndex) {
    if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= levels.length) return false;
    hideModal();
    if (levelIndex !== getCurrentLevel() && !loadLevel(levelIndex)) return false;
    updateUI();
    autoSaveProgress();
    if (typeof window.updateProgressSummary === 'function') window.updateProgressSummary();
    return true;
}

export function nextLevel() {
    if (getCurrentLevel() < levels.length - 1) {
        navigateToLevel(getCurrentLevel() + 1);
    }
    // Note: Final level completion is now handled in checkWinCondition()
}

export function resetLevel() {
    if (getChallengeMode()) {
        restartPracticeSession();
        return;
    }
    loadLevel(getCurrentLevel());
    updateUI();
}

// Challenge Functions
export function finishExpiredPractice(challenge) {
    if (challenge?.mode !== 'time' || !getChallengeStartTime()
        || getChallengeTimeRemaining({ currentChallenge: challenge, challengeStartTime: getChallengeStartTime() }) > 0) return false;

    const timer = getChallengeTimerInterval();
    if (timer) clearInterval(timer);
    setChallengeTimerInterval(null);
    setCurrentChallenge({ ...challenge, finished: true });
    updateChallengeUI(getCurrentChallenge(), getChallengeProgressValue(), getChallengeScoreValue(), 0, getPracticeMetrics());
    updateUI();
    showEditorFeedback(t('timeUp'), 'error', 3500);
    return true;
}

export function startPracticeTimer() {
    const challenge = getCurrentChallenge();
    if (!getChallengeMode() || challenge?.mode !== 'time' || challenge.finished || getChallengeTimerInterval()) return false;

    if (!getChallengeStartTime()) setChallengeStartTime(Date.now());
    if (finishExpiredPractice(challenge)) return false;
    const timerInterval = setInterval(() => {
        if (!getChallengeMode() || !getCurrentChallenge()) {
            clearInterval(timerInterval);
            setChallengeTimerInterval(null);
            return;
        }

        const timeRemaining = getChallengeTimeRemaining({
            currentChallenge: challenge,
            challengeStartTime: getChallengeStartTime()
        });

        if (timeRemaining <= 0) {
            finishExpiredPractice(challenge);
            return;
        }

        updateChallengeUI(
            challenge,
            getChallengeProgressValue(),
            getChallengeScoreValue(),
            timeRemaining,
            getPracticeMetrics()
        );
    }, 1000);

    setChallengeTimerInterval(timerInterval);
    return true;
}

export function restoreSessionLocation(location = readSessionLocation()) {
    if (!location) return;
    const lessonIndex = levels.findIndex(lesson => lesson.id === location.lessonId);
    if (lessonIndex >= 0) loadLevel(lessonIndex);
    configurePractice({ mode: location.practiceMode, duration: location.duration });
    if (location.tab === 'practice' && (!getChallengeMode() || !getCurrentChallenge())) {
        // Progress persistence stores the mode flag, but not the active challenge.
        // Normalize that partial state so toggleChallengeMode can create a session.
        if (getChallengeMode()) setChallengeMode(false);
        toggleChallengeMode();
    }
}

export function toggleChallengeMode({ restorePosition = true } = {}) {
    const location = restorePosition ? readSessionLocation() : null;
    
    setChallengeMode(!getChallengeMode());
    
    if (getChallengeMode()) {
        showChallengeContainer();
        
        const gameStateObj = {
            content: getContent(), cursor: getCursor(), mode: getMode(), currentLevel: getCurrentLevel(), 
            commandHistory: getCommandHistory(), commandLog: getCommandLog(),
            yankedLine: getYankedLine(), replacePending: getReplacePending(), countBuffer: getCountBuffer(), 
            undoStack: getUndoStack(), redoStack: getRedoStack(),
            usedUndo: getUsedUndo(), usedRedoAfterUndo: getUsedRedoAfterUndo(), 
            lastExCommand: getLastExCommand(), searchMode: getSearchMode(),
            searchQuery: getSearchQuery(), lastSearchQuery: getLastSearchQuery(), 
            lastSearchDirection: getLastSearchDirection(), searchMatches: getSearchMatches(),
            currentMatchIndex: getCurrentMatchIndex(), usedSearchInLevel: getUsedSearchInLevel(), 
            navCountSinceSearch: getNavCountSinceSearch(), badges: getBadges(),
            practicedCommands: getPracticedCommands(), challengeMode: getChallengeMode(), 
            currentChallenge: getCurrentChallenge(), challengeTimerInterval: getChallengeTimerInterval(),
            challengeStartTime: getChallengeStartTime(), challengeScoreValue: getChallengeScoreValue(), 
            challengeProgressValue: getChallengeProgressValue(), currentTaskIndex: getCurrentTaskIndex(),
            resetLevelState, resetChallengeState,
            // Add setter functions to update global state
            setContent, setCursor, setMode, setCurrentChallenge, setCurrentTaskIndex,
            setChallengeScoreValue, setChallengeProgressValue, setChallengeStartTime,
            // Add getter functions for challenge validation
            getContent, getCursor, getYankedLine
        };
        
        
        const challenge = startChallenge(gameStateObj);
        if (challenge && location) {
            let index = 0;
            if (challenge.mode === 'golf') {
                index = Math.max(0, challenge.tasks.findIndex(task => task.id === location.golfTaskId));
                setChallengeProgressValue(challenge.tasks.filter(task => getGolfResult(task.id)).length);
            } else if (challenge.mode === 'time' && location.time?.duration === challenge.timeLimit) {
                const saved = location.time;
                const byId = new Map(challenge.tasks.map(task => [task.id, task]));
                const savedCounts = saved.taskIds.reduce((counts, id) => {
                    counts.set(id, (counts.get(id) || 0) + 1);
                    return counts;
                }, new Map());
                const minimumCount = Math.floor(challenge.tasks.length / byId.size);
                const maximumCount = Math.ceil(challenge.tasks.length / byId.size);
                const sameTasks = saved.taskIds.length === challenge.tasks.length
                    && savedCounts.size === byId.size
                    && [...savedCounts].every(([id, count]) => byId.has(id)
                        && count >= minimumCount && count <= maximumCount);
                if (sameTasks) {
                    challenge.tasks = saved.taskIds.map(id => byId.get(id));
                    index = saved.index;
                    setChallengeProgressValue(saved.progress);
                    setChallengeScoreValue(saved.score);
                    const expired = saved.deadline !== null && saved.deadline <= Date.now();
                    challenge.finished = saved.finished || expired;
                    setChallengeStartTime(saved.deadline === null ? 0 : saved.deadline - challenge.timeLimit * 1000);
                }
            }
            setCurrentTaskIndex(index);
            loadChallengeTask(challenge.tasks[index], { setContent, setCursor, setMode, resetLevelState });
        }
        
        // Update the challenge UI with the challenge data
        if (challenge) {
            
            const timeRemaining = challenge.mode === 'time' && getChallengeStartTime()
                ? getChallengeTimeRemaining({ currentChallenge: challenge, challengeStartTime: getChallengeStartTime() })
                : challenge.timeLimit || 0;
            updateChallengeUI(challenge, getChallengeProgressValue(), getChallengeScoreValue(), timeRemaining, getPracticeMetrics());
            
            const timer = getChallengeTimerInterval();
            if (timer) clearInterval(timer);
            setChallengeTimerInterval(null);
            if (challenge.mode === 'time' && getChallengeStartTime() && !challenge.finished) startPracticeTimer();
        }
        
        // Update the main UI to show challenge content
        updateUI();
        
        // Ensure editor gets focus for immediate input
        setTimeout(() => {
            const editorInput = document.getElementById('vim-editor-input');
            if (editorInput) {
                editorInput.focus();
            }
        }, 100);
    } else {
        const timer = getChallengeTimerInterval();
        if (timer) clearInterval(timer);
        setChallengeTimerInterval(null);
        hideChallengeContainer();
        // Return to current level
        loadLevel(getCurrentLevel());
        updateUI();
    }
}

export function restartPracticeSession(config = null) {
    const challenge = getCurrentChallenge();
    if (getChallengeMode() && challenge?.mode === 'golf' && (!config || config.mode === 'golf')) {
        if (config) configurePractice(config);
        selectGolfTask(getCurrentTaskIndex());
        return;
    }
    const timer = getChallengeTimerInterval();
    if (timer) clearInterval(timer);
    setChallengeTimerInterval(null);
    setCurrentChallenge(null);
    setChallengeMode(false);
    configurePractice(config || getPracticeConfig());
    toggleChallengeMode({ restorePosition: Boolean(config && challenge?.mode !== config.mode) });
}

export function selectGolfTask(index) {
    const challenge = getCurrentChallenge();
    if (!getChallengeMode() || challenge?.mode !== 'golf' || !Number.isInteger(index) || !challenge.tasks[index]) return;
    setCurrentTaskIndex(index);
    setCurrentChallenge({ ...challenge, finished: false, golfAttemptComplete: false });
    resetPracticeMetrics();
    loadChallengeTask(challenge.tasks[index], { setContent, setCursor, setMode, resetLevelState });
    const completed = challenge.tasks.filter(task => getGolfResult(task.id)).length;
    setChallengeProgressValue(completed);
    updateChallengeUI(getCurrentChallenge(), completed, 0, 0, getPracticeMetrics());
    updateUI();
}

// Main UI Update Function
let _isUpdatingUI = false; // Guard against infinite loops

export function updateUI() {
    if (_isUpdatingUI) {
        return;
    }
    
    _isUpdatingUI = true;
    
    try {
        renderEditor(getContent(), getCursor(), getMode());
        updateStatusBar(
            getMode(),
            getSearchMode(),
            getSearchQuery(),
            getLastSearchDirection(),
            getSearchMatches(),
            getCurrentMatchIndex(),
            getCommandHistory(),
            getCursor(),
            getCurrentLevel(),
            levels.length
        );
        
        // Use centralized instructions rendering
        updateInstructions();
        
        // Fix stuck challenge mode state when no current challenge exists.
        if (getChallengeMode() && !getCurrentChallenge()) {
            setChallengeMode(false);
            setCurrentChallenge(null);
        }

        updateSessionCommand(getChallengeMode());
        saveSessionLocation();
        
        // Hide level indicator and buttons in challenge mode.
        if (getChallengeMode()) {
            updateLevelIndicator(-1, 0); // Hide level indicator
            // Don't create level buttons in challenge mode.
        } else {
            updateLevelIndicator(getCurrentLevel(), levels.length);
            createLevelButtons(levels, getCurrentLevel());
        }
        
        updateCommandLog(getCommandLog());
        renderBadges(getBadges());
        
        updateStatsBar(getCombo(), getXp());

        if (typeof window.updateRetentionSummary === 'function') {
            window.updateRetentionSummary();
        }
        
    } finally {
        _isUpdatingUI = false;
    }
}

// All functions are already exported as named exports above
