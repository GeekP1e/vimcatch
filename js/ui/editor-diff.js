// Align unchanged lines; pair replacements and pad insertions/deletions like a split diff.
export function alignEditorLines(left, right) {
    const lengths = Array.from({ length: left.length + 1 }, () => new Uint32Array(right.length + 1));
    for (let i = left.length - 1; i >= 0; i--) {
        for (let j = right.length - 1; j >= 0; j--) {
            lengths[i][j] = left[i] === right[j]
                ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
        }
    }
    const rows = [];
    let i = 0, j = 0;
    let removed = [], added = [];
    const flush = () => {
        for (let index = 0; index < Math.max(removed.length, added.length); index++) {
            rows.push({ left: removed[index] ?? null, right: added[index] ?? null, equal: false });
        }
        removed = [];
        added = [];
    };
    while (i < left.length || j < right.length) {
        if (i < left.length && j < right.length && left[i] === right[j]) {
            flush();
            rows.push({ left: i++, right: j++, equal: true });
        } else if (i < left.length && (j === right.length || lengths[i + 1][j] >= lengths[i][j + 1])) {
            removed.push(i++);
        } else {
            added.push(j++);
        }
    }
    flush();
    return rows;
}

export function changedRange(text, other = '') {
    let start = 0;
    while (start < text.length && start < other.length && text[start] === other[start]) start++;
    let end = text.length, otherEnd = other.length;
    while (end > start && otherEnd > start && text[end - 1] === other[otherEnd - 1]) {
        end--;
        otherEnd--;
    }
    return { start, end };
}
