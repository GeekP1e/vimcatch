import { isValidLessonObjective } from './lesson-objective.js';

/**
 * VimCatch - Win Condition Evaluator
 * 
 * A pure function that determines if the game state satisfies the lesson's target.
 * Designed to be shared between the game engine and the Golden Test Suite.
 * 
 * @param {Object} state - The current game state snapshot
 * @param {Object} lesson - The current lesson specification
 * @returns {Object} { won: boolean, reason: string }
 */
export function evaluateWinCondition(state, lesson) {
    if (!lesson) {
        return { won: false, reason: 'No lesson active' };
    }
    if (!isValidLessonObjective(lesson)) {
        return { won: false, reason: 'Lesson objective is invalid' };
    }

    if (lesson.requires !== undefined && !Array.isArray(lesson.requires)) {
        return { won: false, reason: 'Lesson requirements are invalid' };
    }
    const requirements = lesson.requires || [];
    const requirementsMet = requirements.every(requirement => {
        if (!requirement || typeof requirement !== 'object') return false;
        if (requirement.type === 'search') {
            return typeof requirement.query === 'string'
                && ['forward', 'backward'].includes(requirement.direction)
                && Number.isInteger(requirement.minNavigations)
                && requirement.minNavigations >= 0
                && state.usedSearchInLevel
                && state.lastSearchDirection === requirement.direction
                && state.lastSearchQuery?.toLowerCase() === requirement.query.toLowerCase()
                && state.navCountSinceSearch >= requirement.minNavigations;
        }
        if (requirement.type === 'undoThenRedo') {
            return state.usedRedoAfterUndo;
        }
        return false;
    });

    if (!requirementsMet) {
        return { won: false, reason: 'Lesson requirements not met' };
    }

    if (lesson.exCommands) {
        if (state.lastExCommand && lesson.exCommands.includes(state.lastExCommand)) {
            return { won: true, reason: 'Ex command matched' };
        }
    } else if (lesson.target) {
        if (state.cursor.row === lesson.target.row && state.cursor.col === lesson.target.col) {
            return { won: true, reason: 'Cursor reached target' };
        }
    } else if (lesson.targetText) {
        if (state.content[lesson.targetText.line] === lesson.targetText.text && state.mode === 'NORMAL') {
            return { won: true, reason: 'Target text reached in NORMAL mode' };
        }
    } else if (lesson.targetContent) {
        if (state.mode !== 'NORMAL') {
            return { won: false, reason: 'Return to NORMAL mode to complete the edit' };
        }
        // Compare lines after trimming trailing whitespace and ignoring trailing blank lines
        const trimLineEnd = (line) => line.replace(/\s+$/, '');
        const stripTrailingBlankLines = (lines) => {
            const result = [...lines];
            while (result.length > 0 && trimLineEnd(result[result.length - 1]) === '') {
                result.pop();
            }
            return result;
        };
        const currentLines = stripTrailingBlankLines(state.content.map(trimLineEnd));
        const targetLines = stripTrailingBlankLines(lesson.targetContent.map(trimLineEnd));
        
        if (currentLines.length === targetLines.length && currentLines.every((l, i) => l === targetLines[i])) {
            return { won: true, reason: 'Target content matched exactly' };
        }
    }

    return { won: false, reason: 'Win condition not met' };
}
