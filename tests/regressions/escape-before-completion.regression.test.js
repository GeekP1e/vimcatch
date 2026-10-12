import { describe, expect, it } from 'vitest';
import { generatedContent } from '../../js/lessons/generated-content.js';
import { evaluateWinCondition } from '../../js/lessons/win-evaluator.js';
import { resetGameState, setContent, setCursor, getContent, getMode } from '../../js/core/game-state.js';
import { replay } from '../golden/replay.js';

describe('editing requires returning to NORMAL mode', () => {
    it.each(['lesson-insert-before-i', 'lesson-open-line-above', 'lesson-append-line-end', 'lesson-change-word-end-ce'])('%s cannot finish before Esc', id => {
        const lesson = generatedContent.lessons[id];
        resetGameState();
        setContent([...lesson.initialContent]);
        setCursor({ ...lesson.initialCursor });
        replay(lesson.solution.slice(0, -1));
        expect(getMode()).toBe('INSERT');
        expect(evaluateWinCondition({ content: getContent(), mode: getMode() }, lesson).won).toBe(false);
        replay(['Escape']);
        expect(evaluateWinCondition({ content: getContent(), mode: getMode() }, lesson).won).toBe(true);
    });

    it('places 3w immediately after w', () => {
        const ids = generatedContent.index.regularLessons;
        expect(ids.indexOf('lesson-counts-move-faster')).toBe(ids.indexOf('lesson-word-movement') + 1);
    });

    it('teaches 0 from a nonzero column with a standalone solution', () => {
        const lesson = generatedContent.lessons['lesson-line-start-zero'];
        expect(lesson.initialCursor.col).toBeGreaterThan(0);
        expect(lesson.solution).toEqual(['0']);
        expect(lesson.target.col).toBe(0);
    });
});
