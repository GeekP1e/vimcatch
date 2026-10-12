import { describe, expect, it } from 'vitest';
import { alignEditorLines, changedRange } from '../../js/ui/editor-diff.js';

describe('split editor line diff', () => {
    it('pads deleted lines while keeping the following lines aligned', () => {
        expect(alignEditorLines(['first', 'debug', 'last'], ['first', 'last'])).toEqual([
            { left: 0, right: 0, equal: true },
            { left: 1, right: null, equal: false },
            { left: 2, right: 1, equal: true }
        ]);
    });

    it('pairs replacements, detects moves, and preserves duplicate blank lines', () => {
        const left = ['heading', '', 'deploy', 'test', '', 'tail'];
        const right = ['heading', '', 'test', 'deploy', '', 'tail'];
        const rows = alignEditorLines(left, right);
        expect(rows.filter(row => !row.equal)).toHaveLength(2);
        expect(rows.filter(row => row.left !== null).map(row => left[row.left])).toEqual(left);
        expect(rows.filter(row => row.right !== null).map(row => right[row.right])).toEqual(right);
        expect(alignEditorLines(['before'], ['after'])).toEqual([{ left: 0, right: 0, equal: false }]);
        expect(alignEditorLines([], [])).toEqual([]);
    });

    it('highlights only the changed character range', () => {
        expect(changedRange('  environment = "staging";', '  environment = "production";')).toEqual({ start: 17, end: 24 });
        expect(changedRange('same', 'same')).toEqual({ start: 4, end: 4 });
        expect(changedRange('deleted')).toEqual({ start: 0, end: 7 });
    });
});
