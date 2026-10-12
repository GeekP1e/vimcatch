// VimCatch Game - Main Entry Point

import {
    getMode, getCurrentLevel, getSearchMode, getBadges, getCurrentChallenge,
    getPracticedCommands, getChallengeMode, resetGameState, setCurrentLevel,
    setBadges, setPracticedCommands, getCompletedLessonIds, setCompletedLessonIds
} from './core/game-state.js';

import { levels, loadLevel } from './lessons/levels.js';
import { initializeLanguage, t, practiceDescription } from './utils/i18n.js';
import { handleNormalMode, handleInsertMode, handleSearchMode, handleVisualMode } from './core/vim-commands.js';
import {
    initializeDOMReferences, updateLevelIndicator, createLevelButtons, hideModal,
    showCelebration, hideCelebration, renderRetentionPanel,
    updateStreakPill, setCurriculumExplorerExpanded, isCurriculumExplorerExpanded,
    updatePracticeMetrics, updateChallengeUI
} from './ui/ui-components.js';
import {
    openCheat, closeCheat, renderCheatList, downloadLessonTemplate,
    openLessonTemplateModal, closeLessonTemplateModal
} from './ui/cheat-mode.js';
import {
    checkWinCondition, nextLevel, resetLevel, toggleChallengeMode, restartPracticeSession, startPracticeTimer, selectGolfTask,
    updateUI, navigateToLevel, restoreSessionLocation, openTrainingLesson, finishExpiredPractice
} from './ui/event-handlers.js';
import { getPracticeMetrics, recordPracticeKey } from './practice/challenges.js';
import {
    progressSystem, autoLoadProgress,
    autoSaveProgress, clearProgress
} from './storage/progress-system.js';
import {
    initializeRetentionState, getRetentionViewModel, captureResumeSnapshot,
    markSessionExit, resetRetentionState, noteLessonStart
} from './storage/retention-state.js';
import { readSessionLocation, saveSessionLocation } from './storage/session-location.js';
import { deleteCustomLesson, importCustomLesson, isLessonFileSizeValid, restoreCustomLessons } from './lessons/lesson-import.js';
// Game initialization
function initializeGame() {
    restoreCustomLessons();
    const savedLocation = readSessionLocation();
    // Initialize DOM references
    initializeDOMReferences();
    initializeLanguage(() => {
        const count = document.getElementById('feature-level-count');
        if (count) count.textContent = `${levels.length} ${t('lessons')}`;
        renderCheatList(document.getElementById('cheat-content'), document.getElementById('cheat-search')?.value || '');
        updateUI();
        updateRetentionUI();
        const activeChallenge = getCurrentChallenge();
        if (activeChallenge) {
            document.getElementById('challenge-instructions').textContent = practiceDescription(activeChallenge);
            if (activeChallenge.mode === 'golf') updateChallengeUI(activeChallenge, 0, 0, 0, getPracticeMetrics());
        }
        document.querySelectorAll('[data-repeat-label]').forEach(element => { element.textContent = `. ${t('repeat')}`; });
        document.querySelectorAll('[data-repeat-title]').forEach(element => { element.title = t('repeatTitle'); });
        const lessonTemplateModal = document.getElementById('lesson-template-modal');
        if (lessonTemplateModal && !lessonTemplateModal.classList.contains('hidden')) {
            openLessonTemplateModal(lessonTemplateModal);
        }
    });
    
    // Auto-load progress if available. Invalid saves are repaired when
    // possible and backed up otherwise — never silently deleted (PM-0001).
    const progressResult = autoLoadProgress();
    if (progressResult.message) {
        showProgressMessage(progressResult.message, progressResult.loaded ? 'info' : 'error');
    }

    // Resume at the saved level, or start at the first level
    loadLevel(progressResult.loaded ? getCurrentLevel() : 0);
    restoreSessionLocation(savedLocation);
    initializeRetentionState(getCurrentProgressSummary(), getCurrentLessonName(), getCurrentFocusCommand());
    updateRetentionUI();

    // Level count in the feature list is derived, never hardcoded
    const featureLevelCount = document.getElementById('feature-level-count');
    if (featureLevelCount) {
        featureLevelCount.textContent = `${levels.length} ${t('lessons')}`;
    }
    
    // Initial UI update
    updateUI();
    
    // Update progress summary
    updateProgressSummary();
    
    // Setup auto-save
    setupAutoSave();

    window.addEventListener('beforeunload', () => {
        saveSessionLocation();
        autoSaveProgress();
        syncRetentionSnapshot();
        markSessionExit(getCurrentProgressSummary(), getCurrentLessonName(), getCurrentFocusCommand());
    });
}

export function handleVisibleModalEnter(editorInput) {
    if (getChallengeMode()) return false;
    if (getCurrentLevel() === levels.length - 1) {
        showCelebration();
    } else {
        nextLevel();
        hideModal();
        editorInput?.focus();
    }
    return true;
}

export function handleSearchInput(e) {
    handleSearchMode(e);
    updateUI();
    checkWinCondition();
}

// Setup event listeners
export function setupEventListeners() {
    const editorInput = document.getElementById('vim-editor-input');
    const editorContainer = document.getElementById('editor-container');
    const resetBtn = document.getElementById('reset-btn');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const celebrationRestartBtn = document.getElementById('celebration-restart');
    const celebrationPracticeBtn = document.getElementById('celebration-practice');
    const levelSelectionContainer = document.getElementById('level-selection');
    const challengeToggleBtn = document.getElementById('challenge-toggle');
    const retentionPanel = document.getElementById('retention-panel');
    const cheatOverlay = document.getElementById('cheat-overlay');
    const cheatCloseBtn = document.getElementById('cheat-close');
    const lessonTemplateOpenBtn = document.getElementById('lesson-template-open');
    const downloadLessonTemplateBtn = document.getElementById('download-lesson-template');
    const uploadLessonTemplateBtn = document.getElementById('upload-lesson-template');
    const uploadLessonFile = document.getElementById('upload-lesson-file');
    const lessonImportStatus = document.getElementById('lesson-import-status');
    const lessonTemplateCloseBtn = document.getElementById('lesson-template-close');
    const lessonTemplateModal = document.getElementById('lesson-template-modal');
    const cheatSearch = document.getElementById('cheat-search');
    const cheatContent = document.getElementById('cheat-content');
    const cheatPanel = document.getElementById('cheat-panel');
    const practiceMode = document.getElementById('practice-mode');
    const practiceDuration = document.getElementById('practice-duration');
    const practiceStart = document.getElementById('practice-start');
    const practiceDurationWrap = document.getElementById('practice-duration-wrap');

    const clearProgressBtn = document.getElementById('clear-progress-btn');

    downloadLessonTemplateBtn?.addEventListener('click', downloadLessonTemplate);
    uploadLessonTemplateBtn?.addEventListener('click', () => uploadLessonFile?.click());
    uploadLessonFile?.addEventListener('change', async () => {
        const file = uploadLessonFile.files?.[0];
        if (!file) return;
        const showImportStatus = (message, success = false) => {
            if (!lessonImportStatus) return;
            lessonImportStatus.textContent = message;
            lessonImportStatus.className = `mt-4 text-sm ${success ? 'text-green-400' : 'text-red-400'}`;
        };
        try {
            if (!isLessonFileSizeValid(file)) {
                showImportStatus(t('lessonImportTooLarge'));
                return;
            }
            const lesson = JSON.parse(await file.text());
            const result = importCustomLesson(lesson);
            if (!result.success) {
                showImportStatus(t('lessonImportInvalid').replace('{fields}', result.errors.join(', ')));
                return;
            }
            closeLessonTemplateModal(lessonTemplateModal);
            openTrainingLesson(result.index);
            autoSaveProgress();
            showProgressMessage(t('lessonImportSuccess').replace('{name}', result.lesson.name), 'success');
        } catch {
            showImportStatus(t('lessonImportReadError'));
        } finally {
            uploadLessonFile.value = '';
        }
    });
    lessonTemplateOpenBtn?.addEventListener('click', () => openLessonTemplateModal(lessonTemplateModal));
    lessonTemplateCloseBtn?.addEventListener('click', () => closeLessonTemplateModal(lessonTemplateModal));
    lessonTemplateModal?.addEventListener('click', event => {
        if (event.target === lessonTemplateModal) closeLessonTemplateModal(lessonTemplateModal);
    });

    // Clear Progress
    if (clearProgressBtn) {
        clearProgressBtn.addEventListener('click', () => {
            if (confirm(t('confirmResetProgress'))) {
                const result = clearProgress();
                if (result.success) {
                    localStorage.removeItem('vimMasterRetentionState');
                    resetRetentionState();
                    
                    // Reset game state
                    resetGameState();
                    loadLevel(0);
                    // Reload also cancels pending lesson completions and practice callbacks.
                    window.location.reload();
                } else {
                    alert(t('resetProgressError'));
                }
            }
        });
    }

    // Editor input handling
    if (editorInput) {
        editorInput.addEventListener('keydown', (e) => {
            // Check if a modal is visible and handle Enter key for level advancement
            if (e.key === 'Enter') {
                const modal = document.getElementById('modal');
                if (modal && !modal.classList.contains('opacity-0')) {
                    e.preventDefault();
                    handleVisibleModalEnter(editorInput);
                    return; // Crucial to prevent further processing
                }
            }
            
            // Don't process any Vim commands if a modal is visible
            const modal = document.getElementById('modal');
            if (modal && !modal.classList.contains('opacity-0')) {
                return;
            }
            
            if (getChallengeMode()) {
                const challenge = getCurrentChallenge();
                if (challenge?.finished || challenge?.golfAttemptComplete || finishExpiredPractice(challenge)) {
                    e.preventDefault();
                    return;
                }
                if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) startPracticeTimer();
                recordPracticeKey(e);
                updatePracticeMetrics(getPracticeMetrics());
            }
            
            
            // Handle Ctrl+R redo before other commands
            if (getMode() === 'NORMAL' && e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                // Call the redo logic directly from vim-commands
                handleNormalMode(e);
                updateUI();
                checkWinCondition();
                return;
            }
            
            if (getSearchMode()) {
                handleSearchInput(e);
                return;
            }
            if (getMode() === 'NORMAL') {
                handleNormalMode(e);
            } else if (getMode() === 'VISUAL') {
                handleVisualMode(e);
            } else {
                handleInsertMode(e);
            }
            updateUI();
            checkWinCondition();
        });
    }

    // Editor container click to focus
    if (editorContainer) {
        editorContainer.addEventListener('click', event => {
            if (event.target.closest('#target-pane')) return;
            if (editorInput) editorInput.focus();
        });
    }

    if (retentionPanel) {
        retentionPanel.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;

            if (target.id === 'resume-learning-btn') {
                if (editorInput) editorInput.focus();
                editorContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            if (target.id === 'resume-practice-btn') {
                challengeToggleBtn?.click();
            }
        });
    }

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetLevel();
            if (editorInput) editorInput.focus();
        });
    }

    // Next level button
    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', () => {
            if (getCurrentLevel() === levels.length - 1) {
                showCelebration();
            } else {
                nextLevel();
                hideModal();
                if (editorInput) editorInput.focus();
            }
        });
    }

    celebrationPracticeBtn?.addEventListener('click', () => {
        hideModal();
        hideCelebration();
        if (!getChallengeMode()) toggleChallengeMode();
        if (editorInput) editorInput.focus();
        autoSaveProgress();
        updateProgressSummary();
    });

    // Celebration restart button
    if (celebrationRestartBtn) {
        celebrationRestartBtn.addEventListener('click', () => {
            // Save current progress before resetting
            const currentBadges = getBadges();
            const currentPracticedCommands = getPracticedCommands();
            const completedLessonIds = getCompletedLessonIds();
            
            // Reset game state but preserve progress
            resetGameState();
            
            // Restore progress
            setBadges(currentBadges);
            setPracticedCommands(currentPracticedCommands);
            setCompletedLessonIds(completedLessonIds);
            
            // Restart game
            setCurrentLevel(0);
            loadLevel(0);
            updateUI();
            updateLevelIndicator(0, levels.length);
            createLevelButtons(levels, 0);
            hideModal();
            hideCelebration();
            if (editorInput) editorInput.focus();
            
            // Auto-save progress after restart
            autoSaveProgress();
            // Update progress summary display
            updateProgressSummary();
        });
    }

    // Level selection
    if (levelSelectionContainer) {
        levelSelectionContainer.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('button[data-delete-lesson]');
            if (deleteButton) {
                const result = deleteCustomLesson(deleteButton.dataset.deleteLesson);
                if (result.success) {
                    updateUI();
                    autoSaveProgress();
                    saveSessionLocation();
                    showProgressMessage(t('lessonDeleted'), 'success');
                } else {
                    showProgressMessage(t('lessonDeleteError'), 'error');
                }
                return;
            }
            const toggleButton = e.target.closest('button[data-curriculum-toggle]');
            if (toggleButton) {
                setCurriculumExplorerExpanded(!isCurriculumExplorerExpanded());
                createLevelButtons(levels, getCurrentLevel());
                return;
            }

            const button = e.target.closest('button[data-level]');
            if (button) {
                const levelIndex = parseInt(button.dataset.level, 10);
                navigateToLevel(levelIndex);
                if (editorInput) editorInput.focus();
            }
        });
    }

    // Challenge toggle
    if (challengeToggleBtn) {
        challengeToggleBtn.addEventListener('click', toggleChallengeMode);
    }

    const updatePracticeOptions = () => {
        const mode = practiceMode?.querySelector('[data-practice-mode][aria-pressed="true"]')?.dataset.practiceMode || 'time';
        practiceDurationWrap?.classList.toggle('hidden', mode !== 'time');
    };

    const prepareConfiguredPractice = () => {
        const selectedMode = practiceMode?.querySelector('[data-practice-mode][aria-pressed="true"]')?.dataset.practiceMode || 'time';
        restartPracticeSession({
            mode: selectedMode,
            duration: Number(practiceDuration?.value || 60)
        });
        editorInput?.focus();
    };

    practiceMode?.addEventListener('click', (event) => {
        const option = event.target.closest('[data-practice-mode]');
        if (!option) return;
        practiceMode.querySelectorAll('[data-practice-mode]').forEach(button => {
            const selected = button === option;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        updatePracticeOptions();
        prepareConfiguredPractice();
    });
    practiceDuration?.addEventListener('change', prepareConfiguredPractice);
    practiceStart?.addEventListener('click', prepareConfiguredPractice);
    document.getElementById('golf-task-list')?.addEventListener('click', event => {
        const button = event.target.closest('[data-golf-task]');
        if (!button) return;
        selectGolfTask(Number(button.dataset.golfTask));
        editorInput?.focus();
    });
    updatePracticeOptions();

    // Cheat mode event listeners are now set up after the button is created

    if (cheatOverlay) {
        cheatOverlay.addEventListener('click', () => {
            closeCheat(cheatOverlay, cheatPanel, editorInput);
        });
    }

    if (cheatCloseBtn) {
        cheatCloseBtn.addEventListener('click', () => {
            closeCheat(cheatOverlay, cheatPanel, editorInput);
        });
    }

    if (cheatSearch) {
        cheatSearch.addEventListener('input', (e) => {
            renderCheatList(cheatContent, e.target.value);
        });
    }

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        // Toggle Cheat Mode with Ctrl+/
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            e.stopPropagation();
            if (cheatPanel && cheatPanel.classList.contains('translate-x-full')) {
                openCheat(cheatOverlay, cheatPanel, cheatSearch, cheatContent);
            } else {
                closeCheat(cheatOverlay, cheatPanel, editorInput);
            }
        }
    }, true);

    // Cheat mode toggle
    const cheatToggleBtnAfterCreation = document.getElementById('cheat-toggle');
    
    // Cheat mode event listeners
    if (cheatToggleBtnAfterCreation) {
        cheatToggleBtnAfterCreation.addEventListener('click', () => {
            if (cheatPanel && cheatPanel.classList.contains('translate-x-full')) {
                openCheat(cheatOverlay, cheatPanel, cheatSearch, cheatContent);
            } else {
                closeCheat(cheatOverlay, cheatPanel, editorInput);
            }
        });
    }
}

function updateProgressSummary() {
    updateRetentionUI();
}

function showProgressMessage(message, type = 'info') {
    const progressMessage = document.getElementById('progress-message');
    if (progressMessage) {
        progressMessage.textContent = message;
        progressMessage.className = `mt-3 text-center text-sm ${type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-blue-400'}`;
        progressMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideProgressMessage();
        }, 5000);
    }
}

function hideProgressMessage() {
    const progressMessage = document.getElementById('progress-message');
    if (progressMessage) {
        progressMessage.classList.add('hidden');
    }
}

// Auto-save progress when significant changes occur
function setupAutoSave() {
    // Auto-save every 30 seconds and update progress summary
    setInterval(() => {
        autoSaveProgress();
        updateProgressSummary();
    }, 30000);
    
    // Auto-save on level completion happens inside checkWinCondition's win
    // path (event-handlers.js) — a window.checkWinCondition wrapper here was
    // dead code because the function was never assigned to window (TD-3).

    // Update progress summary more frequently for real-time updates
    setInterval(() => {
        updateProgressSummary();
    }, 5000); // Update every 5 seconds
}

function getCurrentLesson() {
    return levels[getCurrentLevel()] || null;
}

function getCurrentLessonName() {
    const lesson = getCurrentLesson();
    return lesson ? lesson.name : '';
}

function getCurrentFocusCommand() {
    const lesson = getCurrentLesson();
    if (!lesson) return '';
    return lesson.focusCommand ? lesson.focusCommand : (lesson.solution ? lesson.solution.join('') : '');
}

function getCurrentProgressSummary() {
    return progressSystem.getProgressSummary();
}

function syncRetentionSnapshot() {
    const summary = getCurrentProgressSummary();
    captureResumeSnapshot(summary, getCurrentLessonName(), getCurrentFocusCommand());
}

function updateRetentionUI() {
    const summary = getCurrentProgressSummary();
    const lesson = getCurrentLesson();
    noteLessonStart(summary.currentLevel ?? 0, lesson ? lesson.name : '', getCurrentFocusCommand());
    const model = getRetentionViewModel(summary, lesson ? lesson.name : '', getCurrentFocusCommand());
    captureResumeSnapshot(summary, lesson ? lesson.name : '', getCurrentFocusCommand());
    renderRetentionPanel(model);
    updateStreakPill(model.streakDays, model.welcomeBack);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    
    // Setup event listeners
    setupEventListeners();
    
    // Make updateProgressSummary globally available
    window.updateProgressSummary = updateProgressSummary;
    window.updateRetentionSummary = updateRetentionUI;
    
    // Focus the editor
    const editorInput = document.getElementById('vim-editor-input');
    if (editorInput) {
        editorInput.focus();
    }
});

// Global challenge functions for modal buttons
window.startNewChallenge = () => {
    // Hide the modal
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
    
    // Start a new random challenge
    restartPracticeSession();
};

window.returnToLevel = () => {
    hideModal();
    openTrainingLesson(getCurrentLevel());
};

