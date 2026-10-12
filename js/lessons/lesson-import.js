import { isValidLessonObjective, WIN_CONDITION_PROPS } from './lesson-objective.js';
import { levels, loadLevel } from './levels.js';
import { getCurrentLevel, setCurrentLevel, getCompletedLessonIds, setCompletedLessonIds } from '../core/game-state.js';
import { deepFreeze } from '../utils/deep-freeze.js';

const STORAGE_KEY = 'vimcatch-custom-lessons-v1';
const MAX_FILE_SIZE = 256 * 1024;
const ALLOWED_FIELDS = new Set([
    'id', 'version', 'name', 'instructions', 'metadata', 'initialContent', 'initialCursor',
    'target', 'targetText', 'targetContent', 'exCommands', 'solution', 'focusCommand', 'files', 'requires'
]);
const ALLOWED_METADATA_FIELDS = new Set([
    'revision', 'author', 'githubUsername', 'created', 'difficulty', 'tags',
    'estimatedTime', 'prerequisites', 'learningObjectives', 'order'
]);
const bundledLessonIds = new Set(levels.map((lesson) => lesson.id));

export const isCustomLesson = (id) => !bundledLessonIds.has(id)
    && levels.some((lesson) => lesson.id === id);

export function deleteCustomLesson(id) {
    if (!isCustomLesson(id)) return { success: false };
    const index = levels.findIndex((lesson) => lesson.id === id);
    const remaining = levels.filter((lesson) => lesson.id !== id);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining.filter((lesson) => !bundledLessonIds.has(lesson.id))));
    } catch {
        return { success: false };
    }

    const currentIndex = getCurrentLevel();
    levels.splice(index, 1);
    const completed = getCompletedLessonIds();
    completed.delete(id);
    setCompletedLessonIds(completed);
    if (currentIndex === index) loadLevel(Math.min(index, levels.length - 1));
    else if (currentIndex > index) setCurrentLevel(currentIndex - 1);
    return { success: true };
}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isStringArray = (value, allowEmpty = true) => Array.isArray(value)
    && (allowEmpty || value.length > 0)
    && value.every((item) => typeof item === 'string');

export function validateImportedLesson(lesson) {
    const errors = [];
    if (!isObject(lesson)) return ['root'];

    const unknown = Object.keys(lesson).filter((field) => !ALLOWED_FIELDS.has(field));
    if (unknown.length > 0) errors.push(`unknown: ${unknown.join(', ')}`);
    if (typeof lesson.id !== 'string' || !/^lesson-[a-z0-9-]+$/.test(lesson.id)) errors.push('id');
    if (lesson.focusCommand !== undefined && typeof lesson.focusCommand !== 'string') errors.push('focusCommand');
    if (lesson.version !== 1) errors.push('version');
    if (typeof lesson.name !== 'string' || lesson.name.trim() === '') errors.push('name');
    if (typeof lesson.instructions !== 'string' || lesson.instructions.trim() === '') errors.push('instructions');
    if (!isStringArray(lesson.initialContent, false)) errors.push('initialContent');
    if (!isValidLessonObjective(lesson)) errors.push(`objective (${WIN_CONDITION_PROPS.join('|')})`);

    if (lesson.initialCursor !== undefined) {
        const cursor = lesson.initialCursor;
        const line = isObject(cursor) && Array.isArray(lesson.initialContent)
            ? lesson.initialContent[cursor.row]
            : undefined;
        if (!isObject(cursor) || !Number.isInteger(cursor.row) || !Number.isInteger(cursor.col)
            || cursor.row < 0 || cursor.col < 0 || typeof line !== 'string'
            || cursor.col > Math.max(0, line.length - 1)) {
            errors.push('initialCursor');
        }
    }

    const validKeys = new Set(['Enter', 'Escape', 'Backspace', '<Esc>']);
    if (!Array.isArray(lesson.solution) || lesson.solution.length === 0
        || !lesson.solution.every((key) => typeof key === 'string'
            && (key.length === 1 || validKeys.has(key) || /^Ctrl\+.$/i.test(key)))) {
        errors.push('solution');
    }

    const metadata = lesson.metadata;
    if (!isObject(metadata)) {
        errors.push('metadata');
    } else {
        const unknownMetadata = Object.keys(metadata).filter((field) => !ALLOWED_METADATA_FIELDS.has(field));
        if (unknownMetadata.length > 0) errors.push(`metadata unknown: ${unknownMetadata.join(', ')}`);
        if (!Number.isFinite(metadata.revision) || !Number.isFinite(metadata.order)
            || typeof metadata.author !== 'string' || metadata.author.trim() === ''
            || typeof metadata.githubUsername !== 'string' || metadata.githubUsername.trim() === ''
            || !Number.isFinite(metadata.estimatedTime)
            || !isStringArray(metadata.tags) || !isStringArray(metadata.prerequisites)
            || !isStringArray(metadata.learningObjectives)
            || (metadata.difficulty !== undefined
                && !['beginner', 'intermediate', 'advanced'].includes(metadata.difficulty))) {
            errors.push('metadata');
        }
    }

    if (lesson.requires !== undefined && (!Array.isArray(lesson.requires)
        || !lesson.requires.every((requirement) => isObject(requirement)
            && (requirement.type === 'undoThenRedo'
                || (requirement.type === 'search'
                    && ['forward', 'backward'].includes(requirement.direction)
                    && typeof requirement.query === 'string' && requirement.query.length > 0
                    && Number.isInteger(requirement.minNavigations) && requirement.minNavigations >= 0))))) {
        errors.push('requires');
    }

    if (lesson.files !== undefined && (!isObject(lesson.files)
        || !Object.values(lesson.files).every((content) => isStringArray(content, false)))) {
        errors.push('files');
    }
    return [...new Set(errors)];
}

const readStoredLessons = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(stored) ? stored : [];
    } catch {
        return [];
    }
};

const storeCustomLessons = () => {
    const customLessons = levels.filter((lesson) => !bundledLessonIds.has(lesson.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customLessons));
};

export function importCustomLesson(lesson) {
    const errors = validateImportedLesson(lesson);
    if (errors.length > 0) return { success: false, errors };
    if (bundledLessonIds.has(lesson.id)) return { success: false, errors: ['bundled-id'] };

    const imported = deepFreeze(structuredClone(lesson));
    const existingIndex = levels.findIndex((item) => item.id === imported.id);
    const previousLesson = existingIndex >= 0 ? levels[existingIndex] : null;
    if (existingIndex >= 0) levels.splice(existingIndex, 1, imported);
    else levels.push(imported);

    try {
        storeCustomLessons();
    } catch {
        if (existingIndex >= 0) levels.splice(existingIndex, 1, previousLesson);
        else levels.pop();
        return { success: false, errors: ['storage'] };
    }
    return { success: true, lesson: imported, index: levels.indexOf(imported) };
}

export function restoreCustomLessons() {
    let restored = 0;
    for (const lesson of readStoredLessons()) {
        if (validateImportedLesson(lesson).length > 0 || bundledLessonIds.has(lesson.id)
            || levels.some((item) => item.id === lesson.id)) continue;
        levels.push(deepFreeze(structuredClone(lesson)));
        restored++;
    }
    return restored;
}

export function isLessonFileSizeValid(file) {
    return file?.size <= MAX_FILE_SIZE;
}
