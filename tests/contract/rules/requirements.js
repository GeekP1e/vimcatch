import { registerRule } from '../validator.js';

const REQUIREMENT_TYPES = new Set(['search', 'undoThenRedo']);

registerRule({
    id: 'L013',
    name: 'Requirements Valid',
    severity: 'error',
    validate: (lesson, report) => {
        if (lesson.requires === undefined) return;
        if (!Array.isArray(lesson.requires)) {
            report('`requires` must be an array.', 'requires');
            return;
        }

        lesson.requires.forEach((requirement, index) => {
            const location = `requires[${index}]`;
            if (!requirement || typeof requirement !== 'object' || !REQUIREMENT_TYPES.has(requirement.type)) {
                report('Requirement has an unsupported `type`.', `${location}.type`);
                return;
            }
            if (requirement.type === 'search') {
                if (!['forward', 'backward'].includes(requirement.direction)) {
                    report('Search requirement needs `direction: forward|backward`.', `${location}.direction`);
                }
                if (typeof requirement.query !== 'string' || requirement.query.length === 0) {
                    report('Search requirement needs a non-empty `query`.', `${location}.query`);
                }
                if (!Number.isInteger(requirement.minNavigations) || requirement.minNavigations < 0) {
                    report('Search requirement needs a non-negative integer `minNavigations`.', `${location}.minNavigations`);
                }
            }
        });
    }
});
