import { registerRule } from '../validator.js';

const VALID_OBJECTIVES = ['target', 'targetText', 'targetContent', 'exCommands'];

registerRule({
    id: 'L005',
    name: 'Objective Missing',
    severity: 'error',
    validate: (lesson, report) => {
        const objectivesCount = VALID_OBJECTIVES.filter(prop => prop in lesson).length;
        if (objectivesCount === 0) {
            report(
                'Lesson is missing a win condition (objective).',
                'objective',
                `Provide exactly one of: ${VALID_OBJECTIVES.join(', ')}.`
            );
        }
    }
});

registerRule({
    id: 'L011',
    name: 'Multiple Objectives Defined',
    severity: 'error',
    validate: (lesson, report) => {
        const objectivesFound = VALID_OBJECTIVES.filter(prop => prop in lesson);
        if (objectivesFound.length > 1) {
            report(
                `Lesson defines multiple win conditions: ${objectivesFound.join(', ')}.`,
                'objective',
                'A lesson can only have exactly one win condition.'
            );
        }
    }
});

registerRule({
    id: 'L014',
    name: 'Objective Invalid',
    severity: 'error',
    validate: (lesson, report) => {
        if ('target' in lesson) {
            const target = lesson.target;
            if (!target || typeof target !== 'object' || !Number.isInteger(target.row) || !Number.isInteger(target.col)) {
                report('`target` must be an object with integer `row` and `col`.', 'target');
            } else if (target.row < 0 || target.col < 0) {
                report('`target.row` and `target.col` must be non-negative.', 'target');
            }
        }

        if ('targetText' in lesson) {
            const targetText = lesson.targetText;
            if (!targetText || typeof targetText !== 'object' || !Number.isInteger(targetText.line)
                || typeof targetText.text !== 'string') {
                report('`targetText` must contain integer `line` and string `text`.', 'targetText');
            } else if (targetText.line < 0) {
                report('`targetText.line` must be non-negative.', 'targetText.line');
            }
        }

        if ('targetContent' in lesson
            && (!Array.isArray(lesson.targetContent) || lesson.targetContent.length === 0
                || !lesson.targetContent.every(line => typeof line === 'string'))) {
            report('`targetContent` must be a non-empty array of strings.', 'targetContent');
        }

        if ('exCommands' in lesson
            && (!Array.isArray(lesson.exCommands) || lesson.exCommands.length === 0
                || !lesson.exCommands.every(command => typeof command === 'string' && command.length > 0))) {
            report('`exCommands` must be a non-empty array of command strings.', 'exCommands');
        }
    }
});
