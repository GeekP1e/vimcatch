// VimCatch Game - UI Components (Updated)

import { escapeHtml, getSearchMatches, getLastSearchQuery } from '../core/game-state.js';
import { t, lessonInstructions, lessonCommandExplanation, practiceInstruction, practiceName, practiceDescription } from '../utils/i18n.js';
// Static imports for core dependencies to avoid performance overhead
import * as levelsModule from '../lessons/levels.js';
import * as gameStateModule from '../core/game-state.js';
import { getGolfResult } from '../practice/challenges.js';
import { alignEditorLines, changedRange } from './editor-diff.js';
import { isCustomLesson } from '../lessons/lesson-import.js';

// DOM Elements
let editorDisplay, statusBar, instructionsEl, commandLogEl, 
    editorContainer, resetBtn, modal, modalContent, modalTitle, modalMessage,
    celebration, levelSelectionContainer,
    challengeContainer, challengeInstructions, challengeTimer,
    challengeProgress, challengeTotal, badgeSection, badgeBar,
    badgeCount, badgeToast, feedbackToast, sessionProgressFill, retentionPanel, streakPill;

let curriculumExplorerExpanded = false;

const CURRICULUM_SECTIONS = [
    {
        key: 'basics',
        titleKey: 'basics',
        descriptionKey: 'basicsDescription',
        lessonIds: ['lesson-how-to-exit-ex-commands', 'lesson-save-and-quit', 'lesson-insert-before-i', 'lesson-insert-mode', 'lesson-append-line-end', 'lesson-insert-variants-review', 'lesson-insert-append-mix']
    },
    {
        key: 'movement',
        titleKey: 'movement',
        descriptionKey: 'movementDescription',
        lessonIds: ['lesson-basic-movement', 'lesson-word-movement', 'lesson-counts-move-faster', 'lesson-word-backward-b', 'lesson-word-end-e', 'lesson-line-start-zero', 'lesson-line-bounds-0-and', 'lesson-line-jumps', 'lesson-first-line-gg', 'lesson-buffer-route-mix', 'lesson-match-brackets']
    },
    {
        key: 'editing',
        titleKey: 'editing',
        descriptionKey: 'editingDescription',
        lessonIds: ['lesson-append-and-open-lines', 'lesson-open-line-above', 'lesson-delete-character-x', 'lesson-delete-line-dd', 'lesson-delete-word-dw', 'lesson-delete-word-end-de', 'lesson-delete-line-end', 'lesson-delete-two-words', 'lesson-delete-two-lines', 'lesson-replace-character-r', 'lesson-substitute-character-s', 'lesson-change-word-cw', 'lesson-change-word-end-ce', 'lesson-change-line-end', 'lesson-yank-put-copy-paste', 'lesson-undo-redo', 'lesson-copy-append-mix', 'lesson-delete-basics', 'lesson-delete-end-replace', 'lesson-delete-repair-mix']
    },
    {
        key: 'visual',
        titleKey: 'visualSection',
        descriptionKey: 'visualDescription',
        lessonIds: ['lesson-visual-delete-v', 'lesson-visual-change-c', 'lesson-visual-line-delete', 'lesson-visual-line-copy', 'lesson-visual-text-copy']
    },
    {
        key: 'search',
        titleKey: 'searchSection',
        descriptionKey: 'searchDescription',
        lessonIds: ['lesson-search-forward', 'lesson-search-backward', 'lesson-search-navigation-n-n', 'lesson-search-change-mix']
    },
    {
        key: 'files',
        titleKey: 'files',
        descriptionKey: 'filesDescription',
        lessonIds: ['lesson-write-file', 'lesson-edit-file']
    },
    {
        key: 'macros',
        titleKey: 'macros',
        descriptionKey: 'macrosDescription',
        lessonIds: ['lesson-record-macro', 'lesson-repeat-macro', 'lesson-macro-prefix-mix']
    },
    {
        key: 'advanced',
        titleKey: 'advanced',
        descriptionKey: 'advancedDescription',
        lessonIds: ['lesson-delete-inner-word-diw', 'lesson-change-inner-word-ciw', 'lesson-inner-word-append-mix', 'lesson-search-inner-word-mix']
    }
];

// Initialize DOM references
export function initializeDOMReferences() {
    editorDisplay = document.getElementById('vim-editor-display');
    statusBar = document.getElementById('status-bar');
    instructionsEl = document.getElementById('instructions');
    commandLogEl = document.getElementById('command-log');
    editorContainer = document.getElementById('editor-container');
    resetBtn = document.getElementById('reset-btn');
    modal = document.getElementById('modal');
    modalContent = document.getElementById('modal-content');
    modalTitle = document.getElementById('modal-title');
    modalMessage = document.getElementById('modal-message');
    celebration = document.getElementById('celebration');
    levelSelectionContainer = document.getElementById('level-selection');
    challengeContainer = document.getElementById('challenge-container');
    challengeInstructions = document.getElementById('challenge-instructions');
    challengeTimer = document.getElementById('timer');
    challengeProgress = document.getElementById('challenge-progress');
    challengeTotal = document.getElementById('challenge-total');
    badgeSection = document.getElementById('badge-section');
    badgeBar = document.getElementById('badge-bar');
    badgeCount = document.getElementById('badge-count');
    badgeToast = document.getElementById('badge-toast');
    feedbackToast = document.getElementById('editor-feedback');
    sessionProgressFill = document.getElementById('session-progress-fill');
    retentionPanel = document.getElementById('retention-panel');
    streakPill = document.getElementById('streak-pill');
}

export function updateSessionCommand(isPractice) {
    const sessionCommand = document.getElementById('session-command');
    if (sessionCommand) {
        sessionCommand.textContent = t(isPractice ? 'practiceCommand' : 'trainCommand');
    }

    const modeToggle = document.getElementById('challenge-toggle');
    if (modeToggle) {
        modeToggle.textContent = t(isPractice ? 'trainCommand' : 'practiceCommand');
        modeToggle.setAttribute('aria-label', t(isPractice ? 'returnToTraining' : 'openPracticeArena'));
    }

    const newSessionButton = document.getElementById('practice-start');
    newSessionButton?.classList.toggle('hidden', !isPractice);
    resetBtn?.classList.toggle('hidden', isPractice);

}

// Editor Rendering
export function renderEditor(content, cursor, mode) {
    if (!editorDisplay) return;
    const challenge = gameStateModule.getChallengeMode() ? gameStateModule.getCurrentChallenge() : null;
    const task = challenge?.tasks[gameStateModule.getCurrentTaskIndex()];
    const split = ['golf', 'time'].includes(challenge?.mode) && Array.isArray(task?.targetContent);
    document.getElementById('editor-workspace')?.classList.toggle('golf-split', split);
    document.getElementById('editable-pane-label')?.classList.toggle('hidden', !split);
    const targetPane = document.getElementById('target-pane');
    targetPane?.classList.toggle('hidden', !split);
    const targetDisplay = document.getElementById('vim-target-display');
    const rows = split ? alignEditorLines(content, task.targetContent)
        : content.map((line, index) => ({ left: index, equal: true }));
    const placeholder = '<div class="editor-line diff-placeholder flex" aria-hidden="true"><span class="line-number w-10"></span><span class="flex-1">&nbsp;</span></div>';
    if (targetDisplay) {
        targetDisplay.setAttribute('aria-label', t('targetText'));
        targetDisplay.innerHTML = split ? rows.map(row => {
            if (row.right === null) return placeholder;
            const line = task.targetContent[row.right];
            const range = row.equal ? { start: 0, end: 0 } : changedRange(line, content[row.left] || '');
            const text = escapeHtml(line.slice(0, range.start))
                + (range.end > range.start ? `<span class="diff-char-added">${escapeHtml(line.slice(range.start, range.end))}</span>` : '')
                + escapeHtml(line.slice(range.end));
            return `<div class="editor-line${row.equal ? '' : ' diff-added'} flex"><span class="line-number w-10">${row.right + 1}</span><span class="flex-1">${text || '&nbsp;'}</span></div>`;
        }).join('') : '';
    }
    
    let html = '';
    const selection = gameStateModule.getVisualSelection();
    const isSelected = (row, col) => mode === 'VISUAL' && selection && (selection.linewise
        ? row >= selection.start.row && row <= selection.end.row
        : (row > selection.start.row || (row === selection.start.row && col >= selection.start.col))
            && (row < selection.end.row || (row === selection.end.row && col <= selection.end.col)));
    const isInMatch = (row, col) => {
        const searchMatches = getSearchMatches();
        for (let i = 0; i < searchMatches.length; i++) {
            const m = searchMatches[i];
            if (m.row === row && col >= m.start && col < m.end) return true;
        }
        return false;
    };
    
    rows.forEach(row => {
        if (row.left === null) {
            html += placeholder;
            return;
        }
        const rowIndex = row.left;
        const line = content[rowIndex];
        const range = split && !row.equal ? changedRange(line, task.targetContent[row.right] || '') : { start: 0, end: 0 };
        const isActiveLine = rowIndex === cursor.row;
        const isSelectedLine = selection?.linewise && isSelected(rowIndex, 0);
        const highlight = !split && task?.highlights?.find(target => target.line === line && (target.row === undefined || target.row === rowIndex));
        const highlightStart = highlight?.col ?? (highlight?.token ? line.indexOf(highlight.token) : 0);
        const highlightEnd = highlight?.token ? highlightStart + highlight.token.length : line.length;
        html += `<div class="editor-line${isActiveLine ? ' active' : ''}${isSelectedLine ? ' visual-line-selection' : ''}${split && !row.equal ? ' diff-removed' : ''} flex"><span class="line-number w-10">${rowIndex + 1}</span><span class="flex-1">`;
        for (let colIndex = 0; colIndex < line.length; colIndex++) {
            const char = line[colIndex];
            const safeChar = escapeHtml(char);
            const highlighted = highlight && colIndex >= highlightStart && colIndex < highlightEnd;
            const changed = colIndex >= range.start && colIndex < range.end;
            const selected = isSelected(rowIndex, colIndex);
            if (changed) html += '<span class="diff-char-removed">';
            if (highlighted) html += '<span class="practice-target">';
            if (selected) html += '<span class="visual-selection">';
            if (rowIndex === cursor.row && colIndex === cursor.col && mode !== 'INSERT') {
                html += `<span class="cursor cursor-normal">${safeChar}</span>`;
            } else {
                if (getLastSearchQuery() && isInMatch(rowIndex, colIndex)) {
                    html += `<span class="bg-yellow-800/60">${safeChar}</span>`;
                } else {
                    html += safeChar;
                }
            }
            if (selected) html += '</span>';
            if (highlighted) html += '</span>';
            if (changed) html += '</span>';
        }
        if (rowIndex === cursor.row && (cursor.col === line.length || line.length === 0)) {
             if (mode !== 'INSERT') {
                html += `<span class="cursor cursor-normal">&nbsp;</span>`;
             } else {
                html += `<span class="cursor cursor-insert inline-block w-px h-6 -mb-1"></span>`;
             }
        }
        html += `</span></div>`;
    });
    editorDisplay.innerHTML = html;
}

// Status Bar Updates
export function updateStatusBar(mode, searchMode, searchQuery, lastSearchDirection, searchMatches, currentMatchIndex, commandHistory = '', cursor = { row: 0, col: 0 }) {
    if (!statusBar) return;

    const modeLabel = commandHistory && commandHistory.startsWith(':')
        ? commandHistory
        : (mode === 'VISUAL' && gameStateModule.getVisualLinewise() ? 'VISUAL LINE' : mode.toUpperCase());
    const modeClass = commandHistory && commandHistory.startsWith(':')
        ? 'status-mode-ex'
        : `status-mode-${mode.toLowerCase()}`;
    const cursorLabel = `Ln ${cursor.row + 1}, Col ${cursor.col + 1}`;
    const searchLabel = searchMode
        ? `${lastSearchDirection === 'backward' ? '?' : '/'}${searchQuery}`
        : (getLastSearchQuery() ? `${lastSearchDirection === 'backward' ? '?' : '/'}${getLastSearchQuery()} ${currentMatchIndex >= 0 ? currentMatchIndex + 1 : 0}/${searchMatches.length}` : '');

    statusBar.innerHTML = `
        <span class="status-mode ${modeClass}">${escapeHtml(modeLabel)}</span>
        <span class="status-sep">│</span>
        <span>${escapeHtml(cursorLabel)}</span>
        ${gameStateModule.getOpenedFile() ? `<span class="status-sep">│</span><span>${escapeHtml(gameStateModule.getOpenedFile())}</span>` : ''}
        ${searchLabel ? `<span class="status-sep">│</span><span class="status-search">${escapeHtml(`Search ${searchLabel}`)}</span>` : ''}
    `;
    statusBar.className = 'status-bar statusline';
}

// Instructions Updates
export function updateInstructions(customText) {
    if (!instructionsEl) return;

    if (customText !== undefined) {
        instructionsEl.innerHTML = customText;
        return;
    }

    if (gameStateModule.getChallengeMode && gameStateModule.getChallengeMode()) {
        const currentChallenge = gameStateModule.getCurrentChallenge();
        const currentTaskIndex = gameStateModule.getCurrentTaskIndex();

        if (currentChallenge && currentTaskIndex !== undefined && currentTaskIndex < currentChallenge.tasks.length) {
            const currentTask = currentChallenge.tasks[currentTaskIndex];
            instructionsEl.innerHTML = `
                <div class="text-center">
                    <div class="text-blue-400 font-bold text-lg mb-2">${escapeHtml(practiceName(currentChallenge))}</div>
                    <div class="text-gray-300 whitespace-pre-line">${escapeHtml(['golf', 'time'].includes(currentChallenge.mode) && Array.isArray(currentTask.targetContent) ? t('matchTarget') : practiceInstruction(currentTask))}</div>
                </div>
            `;
        } else {
            instructionsEl.textContent = t('challengeModeActive');
        }
        return;
    }

    const currentLevel = gameStateModule.getCurrentLevel();
    if (currentLevel !== undefined && levelsModule.levels && levelsModule.levels[currentLevel]) {
        const level = levelsModule.levels[currentLevel];
        const focusCmd = level.focusCommand ? level.focusCommand : (level.solution ? level.solution.join('') : '');
        instructionsEl.innerHTML = `
            <div class="text-center">
                <div class="text-yellow-400 font-bold text-lg mb-2 uppercase tracking-widest">${t('goal')}</div>
                <div class="text-gray-300 text-sm mb-4">${escapeHtml(lessonInstructions(level) || '')}</div>
                <div class="border-t border-b border-gray-700/50 py-3 my-3">
                    <div class="text-5xl md:text-6xl font-mono text-green-400 font-bold tracking-tight">${escapeHtml(focusCmd)}</div>
                </div>
                <div class="text-gray-500 text-xs mt-2 whitespace-pre-line">${escapeHtml(lessonCommandExplanation(level) || t('type'))}</div>
            </div>
        `;
    }
}

// Level Indicator Updates
export function updateLevelIndicator(currentLevel, totalLevels) {
    if (currentLevel < 0 || totalLevels <= 0) {
        if (sessionProgressFill) {
            sessionProgressFill.style.width = '0%';
        }
        if (levelSelectionContainer) {
            levelSelectionContainer.classList.add('hidden');
        }
        return;
    }

    if (sessionProgressFill && totalLevels > 0 && currentLevel >= 0) {
        const completedIds = gameStateModule.getCompletedLessonIds();
        const completed = levelsModule.levels.filter((lesson) => completedIds.has(lesson.id)).length;
        const progress = Math.max(0, Math.min(100, (completed / totalLevels) * 100));
        sessionProgressFill.style.width = `${progress}%`;
    }
    
}

export function updateStreakPill(streakDays, welcomeBack = false) {
    if (!streakPill) return;

    if (!streakDays || streakDays <= 0) {
        streakPill.classList.add('hidden');
        return;
    }

    streakPill.textContent = t('streakDays').replace('{days}', streakDays);
    streakPill.classList.remove('hidden');
    streakPill.classList.toggle('streak-welcome', welcomeBack);
}

export function setCurriculumExplorerExpanded(isExpanded) {
    curriculumExplorerExpanded = Boolean(isExpanded);
}

export function isCurriculumExplorerExpanded() {
    return curriculumExplorerExpanded;
}

// Stats Bar Updates
export function updateStatsBar(combo, xp) {
    const statsBar = document.getElementById('stats-bar');
    const comboDisplay = document.getElementById('combo-display');
    const xpDisplay = document.getElementById('xp-display');
    
    if (statsBar && comboDisplay && xpDisplay) {
        animateStatValue(xpDisplay, xp, 250, 'xp');
        animateStatValue(comboDisplay, combo, 180, 'combo');
    }
}

function prefersReducedMotion() {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function animateStatValue(element, targetValue, duration, kind) {
    if (!element) return;

    const nextValue = Number.isFinite(targetValue) ? Math.max(0, Math.trunc(targetValue)) : 0;
    const currentValue = Number(element.dataset.value ?? element.textContent ?? 0) || 0;

    if (currentValue === nextValue || prefersReducedMotion()) {
        element.textContent = String(nextValue);
        element.dataset.value = String(nextValue);
        return;
    }

    const startTime = performance.now();
    const startValue = currentValue;
    const delta = nextValue - startValue;
    const pulseTarget = kind === 'combo' ? element.closest('#stats-bar') || element : element;

    if (kind === 'combo' && nextValue > startValue) {
        pulseTarget.classList.remove('stat-pop');
        void pulseTarget.offsetWidth;
        pulseTarget.classList.add('stat-pop');
        window.setTimeout(() => pulseTarget.classList.remove('stat-pop'), 220);
    }

    const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(startValue + (delta * eased));
        element.textContent = String(value);
        element.dataset.value = String(value);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = String(nextValue);
            element.dataset.value = String(nextValue);
        }
    };

    window.requestAnimationFrame(step);
}

// Command Log Updates
export function updateCommandLog(commandLog) {
    if (!commandLogEl) return;
    commandLogEl.textContent = commandLog.slice(-10).join('');
}

// Level Buttons Creation
export function createLevelButtons(levels, currentLevel) {
    if (!levelSelectionContainer) return;

    levelSelectionContainer.classList.remove('hidden');
    levelSelectionContainer.className = 'curriculum-explorer grid gap-3';

    const totalLessons = levels.length;
    const completedIds = gameStateModule.getCompletedLessonIds();
    const renderLessonNode = (lesson, index) => {
        const isCompleted = completedIds.has(lesson.id);
        const isCurrent = index === currentLevel;
        const state = isCurrent ? 'current' : (isCompleted ? 'completed' : 'available');
        const shortLabel = lesson.focusCommand || lesson.name;
        const title = lesson.name;

        const node = `
            <button
                type="button"
                data-level="${index}"
                class="curriculum-node curriculum-node--${state}"
                aria-current="${isCurrent ? 'step' : 'false'}"
                title="${escapeHtml(title)}"
            >
                <span class="curriculum-node-state">${isCompleted ? '✓' : (isCurrent ? '▶' : '•')}</span>
                <span class="curriculum-node-command">${escapeHtml(shortLabel)}</span>
                <span class="curriculum-node-name">${escapeHtml(title)}</span>
            </button>
        `;
        return isCustomLesson(lesson.id) ? `
            <div class="custom-lesson-node">
                ${node}
                <button type="button" class="curriculum-map-toggle" data-delete-lesson="${escapeHtml(lesson.id)}" aria-label="${escapeHtml(t('deleteLesson'))}: ${escapeHtml(lesson.name)}">${t('deleteLesson')}</button>
            </div>
        ` : node;
    };

    const renderSectionCard = (section) => {
        const lessons = section.lessonIds
            .flatMap((id) => levels
                .map((lesson, index) => ({ ...lesson, index }))
                .filter((lesson) => lesson.id === id))
            .sort((a, b) => a.index - b.index);

        const total = lessons.length;
        const completed = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
        const currentInSection = lessons.find(({ index }) => index === currentLevel);
        const sectionState = currentInSection
            ? 'current'
            : (total > 0 && completed === total ? 'completed' : 'available');
        const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
        const progressLabel = `${completed} / ${total} ${t('lessons')}`;

        return `
            <article class="curriculum-section curriculum-section--${sectionState}">
                <div class="curriculum-section-header">
                    <div>
                        <div class="curriculum-section-title">${escapeHtml(t(section.titleKey))}</div>
                        <div class="curriculum-section-subtitle">${escapeHtml(t(section.descriptionKey))}</div>
                    </div>
                    <div class="curriculum-section-badge">${progressPercent}%</div>
                </div>
                <div class="curriculum-progress">
                    <div class="curriculum-progress-fill" style="width:${progressPercent}%"></div>
                </div>
                <div class="curriculum-progress-meta">${progressLabel}</div>
                <div class="curriculum-nodes">
                    ${lessons.map(({ index, ...lesson }) => renderLessonNode(lesson, index)).join('')}
                </div>
            </article>
        `;
    };

    const completedLessons = levels.filter((lesson) => completedIds.has(lesson.id)).length;
    const summaryCard = `
        <article class="curriculum-console">
            <span class="curriculum-console-prompt">$ lesson</span>
            <span id="minimal-progress" class="hud-stat curriculum-lesson-progress">${t('lesson')} ${currentLevel + 1} / ${totalLessons} · ✓ ${completedLessons} / ${totalLessons}</span>
            <div class="curriculum-console-actions">
                ${isCustomLesson(levels[currentLevel]?.id) ? `<button type="button" class="curriculum-map-toggle" data-delete-lesson="${escapeHtml(levels[currentLevel].id)}">${t('deleteLesson')}</button>` : ''}
                <button type="button" data-level="${currentLevel - 1}" class="curriculum-icon" aria-label="${escapeHtml(t('previousLesson'))}" ${currentLevel <= 0 ? 'disabled' : ''}>←</button>
                <button type="button" data-level="${currentLevel + 1}" class="curriculum-icon" aria-label="${escapeHtml(t('nextLesson'))}" ${currentLevel >= totalLessons - 1 ? 'disabled' : ''}>→</button>
                <button type="button" data-curriculum-toggle="true" class="curriculum-map-toggle">
                    ${t(curriculumExplorerExpanded ? 'closeMap' : 'map')}
                </button>
            </div>
        </article>
    `;

    const knownLessonIds = new Set(CURRICULUM_SECTIONS.flatMap((section) => section.lessonIds));
    const customLessonIds = levels.filter((lesson) => !knownLessonIds.has(lesson.id)).map((lesson) => lesson.id);
    const sections = customLessonIds.length > 0
        ? [...CURRICULUM_SECTIONS, {
            key: 'custom', titleKey: 'customLessons', descriptionKey: 'customLessonsDescription', lessonIds: customLessonIds
        }]
        : CURRICULUM_SECTIONS;
    const explorerBody = curriculumExplorerExpanded ? `
        <div class="curriculum-grid">
            ${sections.map(renderSectionCard).join('')}
        </div>
    ` : '';

    levelSelectionContainer.innerHTML = `
        <section class="curriculum-shell">
            ${summaryCard}
            ${explorerBody}
        </section>
    `;
}

// Badge Rendering
export function renderBadges(badges) {
    if (!badgeBar || !badgeSection || !badgeCount) return;
    
    badgeBar.innerHTML = '';
    const badgeDefs = {
        beginner: { label: t('beginner'), title: t('beginnerTitle') },
        searchmaster: { label: t('searchmaster'), title: t('searchmasterTitle') }
    };
    const earned = Array.from(badges).filter((key) => badgeDefs[key]);
    if (earned.length === 0) {
        badgeSection.classList.add('hidden');
        return;
    }
    badgeSection.classList.remove('hidden');
    badgeCount.textContent = String(earned.length);
    earned.forEach((key) => {
        const def = badgeDefs[key];
        if (!def) return;
        const el = document.createElement('div');
        el.className = 'achievement-chip';
        el.title = def.title;
        el.textContent = def.label;
        badgeBar.appendChild(el);
    });
}

// Badge Toast
export function showBadgeToast(message) {
    if (!badgeToast) return;
    
    badgeToast.textContent = message;
    badgeToast.classList.remove('hidden');
    badgeToast.classList.remove('show');
    void badgeToast.offsetWidth;
    badgeToast.classList.add('show');
    window.clearTimeout(badgeToast._hideTimer);
    badgeToast._hideTimer = window.setTimeout(() => {
        badgeToast.classList.remove('show');
        window.setTimeout(() => badgeToast.classList.add('hidden'), 180);
    }, 1800);
}

export function showEditorFeedback(message, variant = 'success', duration = 420) {
    if (!feedbackToast) return;

    feedbackToast.textContent = message;
    feedbackToast.dataset.variant = variant;
    feedbackToast.classList.remove('hidden', 'show', 'success', 'error');
    feedbackToast.classList.add(variant);
    void feedbackToast.offsetWidth;
    requestAnimationFrame(() => feedbackToast.classList.add('show'));

    window.clearTimeout(feedbackToast._hideTimer);
    feedbackToast._hideTimer = window.setTimeout(() => {
        feedbackToast.classList.remove('show');
        window.setTimeout(() => feedbackToast.classList.add('hidden'), 180);
    }, duration);
}

export function renderRetentionPanel(viewModel) {
    if (!retentionPanel) return;

    if (!viewModel) {
        retentionPanel.innerHTML = '';
        retentionPanel.classList.add('hidden');
        return;
    }

    retentionPanel.classList.remove('hidden');

    const escape = (value) => escapeHtml(String(value ?? ''));
    const resumeButton = `<button id="resume-learning-btn" class="retention-action">${escapeHtml(t('resume'))} →</button>`;
    const startButton = `<button id="resume-learning-btn" class="retention-action">${escapeHtml(t('start'))} →</button>`;
    const practiceButton = `<button id="resume-practice-btn" class="retention-action">${escapeHtml(t('practiceRandom'))}</button>`;

    const streakMessage = viewModel.welcomeBack
        ? t('welcomeBack')
        : t('keepStreak');
    const primaryLesson = viewModel.continueLearning || viewModel.lastSession;
    const title = viewModel.continueLearning
        ? t('practiceHub')
        : (viewModel.emptyState ? t(viewModel.completedAllLessons ? 'congratulations' : 'readyToLearn') : t('practiceHub'));
    const subtitle = primaryLesson
        ? escape(primaryLesson.lessonLabel)
        : (viewModel.emptyState ? t(viewModel.completedAllLessons ? 'practiceRandom' : 'sessionSummary') : t('sessionSummary'));
    const progressPercent = viewModel.continueLearning ? viewModel.continueLearning.progressPercent : 0;
    const primaryAction = viewModel.continueLearning ? resumeButton : (viewModel.completedAllLessons ? practiceButton : startButton);

    retentionPanel.innerHTML = `
        <section class="retention-card retention-hub">
            <div class="retention-kicker">${escapeHtml(t('practiceHub'))}</div>
            <div class="retention-title">${title}</div>
            <div class="retention-subtle">${subtitle}</div>
            <div class="retention-hub-row">
                <div class="retention-hub-pill">
                    <span class="retention-hub-label">${escapeHtml(t('streak'))}</span>
                    <span class="retention-hub-value">${escape(viewModel.streakDays > 0 ? t('days').replace('{days}', viewModel.streakDays) : t('start'))}</span>
                </div>
                <div class="retention-hub-pill">
                    <span class="retention-hub-label">XP</span>
                    <span class="retention-hub-value">+${escape(viewModel.dashboard.xpEarned)}</span>
                </div>
                <div class="retention-hub-pill">
                    <span class="retention-hub-label">${escapeHtml(t('lessons'))}</span>
                    <span class="retention-hub-value">${escape(viewModel.dashboard.lessonsCompleted)}</span>
                </div>
                <div class="retention-hub-pill">
                    <span class="retention-hub-label">${escapeHtml(t('accuracy'))}</span>
                    <span class="retention-hub-value">${escape(viewModel.dashboard.accuracy)}%</span>
                </div>
            </div>
            ${primaryLesson ? `<div class="retention-progress"><div class="retention-progress-fill" style="width:${progressPercent}%"></div></div>` : ''}
            <div class="retention-meta">${escape(streakMessage)}</div>
            <div class="retention-actions">${primaryAction}</div>
        </section>
    `;
}

// Modal Functions
export function showModal(title, message) {
    if (!modal || !modalTitle || !modalMessage) return;
    
    modalTitle.textContent = title;
    modalMessage.innerHTML = message; // Use innerHTML to render HTML content like buttons
    
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-95');
}

export function hideModal() {
    if (!modal || !modalContent) return;
    
    modal.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.add('scale-95');
}

// Celebration Functions
export function showCelebration() {
    if (!celebration) return;
    
    celebration.classList.remove('hidden');
    celebration.style.left = '0';
    celebration.style.top = '0';
    celebration.style.right = '0';
    celebration.style.bottom = '0';
}

export function hideCelebration() {
    if (!celebration) return;
    
    celebration.classList.add('hidden');
    celebration.style.left = '';
    celebration.style.top = '';
    celebration.style.right = '';
    celebration.style.bottom = '';
    celebration.querySelectorAll('.confetti').forEach(n => n.remove());
}

// Level Complete Flash
export function flashLevelComplete() {
    if (!editorContainer) return;
    
    editorContainer.classList.add('success-pulse');
    setTimeout(() => {
        editorContainer.classList.remove('success-pulse');
    }, 800);
}

export function flashError() {
    if (!editorContainer) return;
    
    editorContainer.classList.add('error-flash');
    setTimeout(() => {
        editorContainer.classList.remove('error-flash');
    }, 500);
}

// Challenge UI Updates
export function updateChallengeUI(challenge, progress, score, timeRemaining, metrics = null) {
    if (!challenge) return;

    const timerWrap = document.getElementById('practice-timer-wrap');
    timerWrap?.classList.toggle('hidden', challenge.mode !== 'time');
    document.querySelectorAll('[data-practice-mode]').forEach(button => {
        const active = button.dataset.practiceMode === challenge.mode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('practice-duration-wrap')?.classList.toggle('hidden', challenge.mode !== 'time');
    const duration = document.getElementById('practice-duration');
    if (duration && challenge.mode === 'time') duration.value = String(challenge.timeLimit);
    document.getElementById('practice-results')?.classList.remove('hidden');
    document.getElementById('time-completed-label')?.classList.toggle('hidden', challenge.mode !== 'time');
    document.getElementById('challenge-total-wrap')?.classList.toggle('hidden', challenge.mode === 'time');
    document.getElementById('golf-completed-label')?.classList.toggle('hidden', challenge.mode === 'time');
    document.getElementById('practice-score-wrap')?.classList.toggle('hidden', challenge.mode === 'golf');
    document.getElementById('golf-results')?.classList.toggle('hidden', challenge.mode !== 'golf');
    if (challenge.mode === 'golf') renderGolfResults(challenge);
    
    if (challengeInstructions) {
        challengeInstructions.textContent = practiceDescription(challenge);
    }
    
    if (challengeTotal) {
        challengeTotal.textContent = challenge.tasks.length;
    }
    
    if (challengeProgress) {
        challengeProgress.textContent = challenge.mode === 'golf'
            ? challenge.tasks.filter(task => getGolfResult(task.id)).length : progress;
    }

    const challengeScore = document.getElementById('challenge-score');
    if (challengeScore) challengeScore.textContent = String(score);
    
    if (challengeTimer && challenge.mode === 'time') {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        challengeTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    if (metrics) updatePracticeMetrics(metrics);
}

export function updatePracticeMetrics(metrics) {
    if (!metrics) return;
    const values = {
        'practice-keystrokes': metrics.keystrokes,
        'practice-deviation': `+${metrics.deviation}`,
        'practice-accuracy': `${metrics.accuracy}%`,
        'practice-streak': metrics.streak,
        'practice-best-streak': metrics.bestStreak
    };
    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = String(value);
    });
    const challenge = gameStateModule.getCurrentChallenge();
    if (gameStateModule.getChallengeMode() && challenge?.mode === 'golf') {
        const current = document.getElementById('golf-current');
        if (current) current.textContent = String(challenge.golfAttemptComplete
            ? getGolfResult(challenge.tasks[gameStateModule.getCurrentTaskIndex()].id)?.last ?? 0
            : metrics.keystrokes - metrics.taskStartKeys);
    }
}

export function renderGolfResults(challenge) {
    const index = gameStateModule.getCurrentTaskIndex();
    const result = getGolfResult(challenge.tasks[index]?.id);
    const last = document.getElementById('golf-last');
    const best = document.getElementById('golf-best');
    if (last) last.textContent = result ? `${result.last} ${t('golfKeys')}` : '—';
    if (best) best.textContent = result ? `${result.best} ${t('golfKeys')}` : '—';
    const list = document.getElementById('golf-task-list');
    if (list) list.innerHTML = challenge.tasks.map((task, taskIndex) => {
        const saved = getGolfResult(task.id);
        return `<button type="button" class="hud-action" data-golf-task="${taskIndex}" aria-pressed="${taskIndex === index}">
            ${escapeHtml(t(task.titleKey))} · ${escapeHtml(t('golfBest'))}: ${saved?.best ?? '—'}
        </button>`;
    }).join('');
}

export function showChallengeContainer() {
    if (challengeContainer) {
        const goalCard = document.querySelector('.goal-card');
        if (goalCard && challengeContainer.nextElementSibling !== goalCard) {
            goalCard.parentElement.insertBefore(challengeContainer, goalCard);
        }
        challengeContainer.classList.remove('hidden');
    }
}

export function hideChallengeContainer() {
    if (challengeContainer) {
        challengeContainer.classList.add('hidden');
    }
}

