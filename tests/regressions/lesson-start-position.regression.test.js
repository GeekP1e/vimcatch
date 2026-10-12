/**
 * Regression ID: TD-0002
 * 
 * Issue: configured lesson start positions must take effect.
 * 
 * Original Cause: The engine explicitly called `level.setup({ cursor: getCursor(), ... })`,
 * which passed a defensive copy of the cursor to the level. The level mutated the copy,
 * but the engine never read the mutated copy back. This caused every level to start at {row:0, col:0}
 * regardless of its configured starting position.
 * 
 * User Impact: Users started lessons at the beginning of the text, often having to navigate 
 * manually to the relevant section before they could begin the actual exercise.
 * 
 * Fixed by the single lesson-initialization pipeline.
 * 
 * Test Strategy:
 * 1. Verify that `initialCursor` is applied to game state.
 * 2. Verify that if a lesson requests an invalid/out-of-bounds cursor, the engine 
 *    clamps it to the buffer dimensions and emits a warning.
 * 
 * Never Break Again: lesson start positions are declarative and JSON-compatible.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadFixture } from '../helpers/fixtures.js';
import { initializeLessonState } from '../../js/lessons/levels.js';
import { getContent, getCursor, setContent } from '../../js/core/game-state.js';
import { logger } from '../../js/utils/logger.js';

describe('Regression: TD-0002 Lesson Start Position', () => {
    let originalConsoleWarn;

    beforeEach(() => {
        // Force the logger's production console format — the singleton
        // auto-detects "development" from hostname/localStorage, which
        // differs between local Node and CI. In development format, warns
        // with metadata go through console.group, not console.warn, and
        // this test's spy would see nothing.
        logger.configure({ development: false });
        originalConsoleWarn = console.warn;
        console.warn = vi.fn();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
        vi.restoreAllMocks();
    });

    it('should apply a valid custom cursor position defined by the lesson', () => {
        const fixture = loadFixture('lessons', 'custom-start.json');
        initializeLessonState(fixture);

        const currentCursor = getCursor();
        expect(currentCursor.row).toBe(1);
        expect(currentCursor.col).toBe(5);
        expect(console.warn).not.toHaveBeenCalled();
    });

    it('should clamp an out-of-bounds cursor and emit a warning', () => {
        const fixture = loadFixture('lessons', 'invalid-cursor.json');
        initializeLessonState(fixture);

        const currentCursor = getCursor();
        
        // Should clamp to the last row (index 1) and the end of that row
        expect(currentCursor.row).toBe(1);
        expect(currentCursor.col).toBe(fixture.initialContent[1].length - 1);
        
        // Should warn that clamping occurred (via the structured logger,
        // which passes metadata as a second console argument)
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('is outside the buffer — clamped to'),
            expect.anything()
        );
    });

    it('should reject a lesson without exactly one objective', () => {
        const fixture = loadFixture('lessons', 'custom-start.json');
        delete fixture.targetContent;

        expect(initializeLessonState(fixture)).toBe(false);
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('must define exactly one win condition'),
            expect.anything()
        );
    });

    it('should reject a buffer containing non-string lines', () => {
        const fixture = loadFixture('lessons', 'custom-start.json');
        fixture.initialContent = [42];

        expect(initializeLessonState(fixture)).toBe(false);
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('has no valid initialContent buffer'),
            expect.anything()
        );
    });

    it('should reject a malformed objective before changing state', () => {
        const fixture = loadFixture('lessons', 'custom-start.json');
        fixture.targetContent = 'invalid';
        setContent(['preserved']);

        expect(initializeLessonState(fixture)).toBe(false);
        expect(getContent()).toEqual(['preserved']);
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('has an invalid win condition'),
            expect.anything()
        );
    });
});
