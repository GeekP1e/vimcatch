// VimCatch Game - Level Definitions and Management

import {
    resetLevelState, setContent, setCursor, setMode,
    setCurrentLevel, setCommandHistory
} from '../core/game-state.js';

// Level Definitions
import { loadRegularLessons } from './content-loader.js';
import { logger, CATEGORIES } from '../utils/logger.js';
import { isValidLessonObjective, WIN_CONDITION_PROPS } from './lesson-objective.js';
// The catalog contains frozen bundled lessons and may receive validated,
// frozen user lessons imported from the web interface.
const bundledLessons = loadRegularLessons();
export const bundledLessonIds = new Set(bundledLessons.map((lesson) => lesson.id));
export const levels = [...bundledLessons];

// Lesson Initialization Pipeline
//
// The ONLY way JSON lesson content becomes playable state. Parallel
// initialization code paths are not accepted.
//
// Schema validation is enforced in CI by the content validator
// (tests/contract/: per-lesson rules + semantic-rules.js — issue #26):
// cursor within buffer, buffer shape, objective validity, solution key
// tokens, unique IDs, resolvable prerequisites, index consistency; the
// Golden Suite replays every solution. The guards below remain as
// runtime defense-in-depth for content loaded outside CI.

// Lesson properties that are defined by the content schema but consumed
// outside runtime initialization: `solution` is replayed by the Golden
// Suite in CI, the rest are read by the UI/content tooling. Acknowledged
// here so the consumption invariant only flags genuinely unknown fields.
// Keep in sync with ALLOWED_FIELDS in tests/contract/rules/unknown-fields.js.
const PASSIVE_LESSON_PROPS = ['id', 'version', 'metadata', 'focusCommand', 'solution', 'files', 'requires'];

const validateLessonForInitialization = (lesson) => {
    if (!lesson || !Array.isArray(lesson.initialContent) || lesson.initialContent.length === 0
        || !lesson.initialContent.every(line => typeof line === 'string')) {
        return { valid: false, reason: 'buffer', objectives: [] };
    }

    const objectives = WIN_CONDITION_PROPS.filter((prop) => prop in lesson);
    if (objectives.length !== 1) return { valid: false, reason: 'objective-count', objectives };
    if (!isValidLessonObjective(lesson)) return { valid: false, reason: 'objective-shape', objectives };
    return { valid: true, objectives };
};

const reportInvalidLesson = (lesson, validation) => {
    if (validation.reason === 'buffer') {
        logger.warn(CATEGORIES.LESSON, `Lesson "${lesson?.name ?? '?'}" has no valid initialContent buffer — not loaded`, { lessonId: lesson?.id });
    } else if (validation.reason === 'objective-count') {
        logger.warn(CATEGORIES.LESSON, `Lesson "${lesson.name}" must define exactly one win condition, found ${validation.objectives.length}`, { lessonId: lesson.id, objectives: validation.objectives });
    } else {
        logger.warn(CATEGORIES.LESSON, `Lesson "${lesson.name}" has an invalid win condition`, { lessonId: lesson.id, objective: validation.objectives[0] });
    }
};

export const initializeLessonState = (lesson) => {
    // --- lesson validates -------------------------------------------------
    const validation = validateLessonForInitialization(lesson);
    if (!validation.valid) {
        reportInvalidLesson(lesson, validation);
        return false;
    }

    // Invariant: every lesson property must be recognized by initialization or
    // an explicit downstream consumer. Anything left unknown at the end is
    // reported immediately (a field the engine ignores is a silent bug — the
    // root cause of TD-2).
    const consumed = new Set();
    const read = (prop) => { consumed.add(prop); return lesson[prop]; };

    // Metadata (rendered by the UI from game state / level lookups)
    read('name');
    read('instructions');

    // Objective: register the win condition; exactly one is required.
    const { objectives } = validation;
    objectives.forEach(read);

    // --- state initializes ------------------------------------------------
    const buffer = read('initialContent');
    setContent(buffer);

    // --- cursor created (defaults) -----------------------------------------
    // --- cursor positioned --------------------------------------------------
    const initialCursor = read('initialCursor');
    const requestedCursor = initialCursor && typeof initialCursor === 'object'
        ? initialCursor
        : { row: 0, col: 0 };

    // Schema fields consumed outside runtime init (CI, UI, tooling)
    PASSIVE_LESSON_PROPS.forEach(read);

    // Clamp the requested cursor into the buffer: a bad position is
    // corrected and reported, never silently accepted.
    const requestedRow = Number.isInteger(requestedCursor.row) ? requestedCursor.row : 0;
    const requestedCol = Number.isInteger(requestedCursor.col) ? requestedCursor.col : 0;
    const row = Math.min(Math.max(requestedRow, 0), buffer.length - 1);
    const col = Math.min(Math.max(requestedCol, 0), Math.max(0, buffer[row].length - 1));
    if (row !== requestedRow || col !== requestedCol) {
        logger.warn(CATEGORIES.LESSON, `Lesson "${lesson.name}" start cursor {${requestedRow},${requestedCol}} is outside the buffer — clamped to {${row},${col}}`, { lessonId: lesson.id });
    }

    setCursor({ row, col });
    setMode('NORMAL');
    setCommandHistory('');

    // --- consumption check --------------------------------------------------
    const unconsumed = Object.keys(lesson).filter((key) => !consumed.has(key));
    if (unconsumed.length > 0) {
        logger.warn(CATEGORIES.LESSON, `Lesson "${lesson.name}" has properties that were never consumed during initialization: ${unconsumed.join(', ')}`, { lessonId: lesson.id, unconsumed });
    }

    // buffer rendered / game starts: the caller triggers updateUI()
    return true;
};

// Level Management Functions
export const loadLevel = (levelIndex) => {
    if (levelIndex < 0 || levelIndex >= levels.length) {
        return false;
    }

    const lesson = levels[levelIndex];
    const validation = validateLessonForInitialization(lesson);
    if (!validation.valid) {
        reportInvalidLesson(lesson, validation);
        return false;
    }

    setCurrentLevel(levelIndex);
    resetLevelState();
    return initializeLessonState(lesson);
};

