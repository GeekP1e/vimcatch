export const WIN_CONDITION_PROPS = ['target', 'targetText', 'targetContent', 'exCommands'];

export const isValidLessonObjective = (lesson) => {
    if (!lesson || typeof lesson !== 'object') return false;

    const objectives = WIN_CONDITION_PROPS.filter((prop) => prop in lesson);
    if (objectives.length !== 1) return false;

    const [objective] = objectives;
    if (objective === 'target') {
        return lesson.target !== null
            && typeof lesson.target === 'object'
            && Number.isInteger(lesson.target.row)
            && lesson.target.row >= 0
            && Number.isInteger(lesson.target.col)
            && lesson.target.col >= 0;
    }
    if (objective === 'targetText') {
        return lesson.targetText !== null
            && typeof lesson.targetText === 'object'
            && Number.isInteger(lesson.targetText.line)
            && lesson.targetText.line >= 0
            && typeof lesson.targetText.text === 'string';
    }
    if (objective === 'targetContent') {
        return Array.isArray(lesson.targetContent)
            && lesson.targetContent.length > 0
            && lesson.targetContent.every((line) => typeof line === 'string');
    }
    return Array.isArray(lesson.exCommands)
        && lesson.exCommands.length > 0
        && lesson.exCommands.every((command) => typeof command === 'string' && command.length > 0);
};
