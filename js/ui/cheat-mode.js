// VimCatch Game - Command Reference

import { t, translateHint, lessonCommandExplanation } from '../utils/i18n.js';

// Localized command-reference catalog
const commandCatalog = [
    {
        category: 'Movement',
        items: [
            { key: 'h / j / k / l', type: 'Motion', focusCommand: 'hjkl' },
            { key: 'w / b / e', type: 'Motion', focusCommand: 'w b e' },
            { key: 'gg / G', type: 'Motion', focusCommand: 'gg G' },
            { key: '0 / $', type: 'Motion', focusCommand: '0 $' },
        ]
    },
    {
        category: 'Editing',
        items: [
            { key: 'i / a / A', type: 'Mode command', focusCommand: 'i a A' },
            { key: 'x', type: 'Immediate command', focusCommand: 'x' },
            { key: 'dd', type: 'Operator + line', focusCommand: 'dd' },
            { key: 'dw', type: 'Operator + motion', focusCommand: 'dw' },
            { key: 'yy', type: 'Operator + line', focusCommand: 'yy' },
            { key: 'p / P', type: 'Immediate command', focusCommand: 'p P' },
            { key: 'cw', type: 'Operator + motion', focusCommand: 'cw' },
            { key: 'D', type: 'Operator shortcut', focusCommand: 'D' },
            { key: 'r', type: 'Immediate command', focusCommand: 'r' },
            { key: 's', type: 'Mode command', focusCommand: 's' },
            { key: 'v', type: 'Mode command', focusCommand: 'v' },
            { key: 'V', type: 'Mode command', focusCommand: 'V' },
            { key: 'c (Visual)', type: 'Mode command', focusCommand: 'c' },
            { key: 'y (Visual)', type: 'Immediate command', focusCommand: 'y' },
            { key: 'v4ly → p / P', type: 'Operator + command', focusCommand: 'v4ly → p / P' },
        ]
    },
    {
        category: 'Search',
        items: [
            { key: '/text', type: 'Search command', focusCommand: '/' },
            { key: '?text', type: 'Search command', focusCommand: '?' },
            { key: 'n / N', type: 'Repeat command', focusCommand: 'n N' },
        ]
    },
    {
        category: 'Other',
        items: [
            { key: 'u / Ctrl+r', type: 'History command', focusCommand: 'u Ctrl+r' },
            { key: ':q / :wq', type: 'Ex command', focusCommand: ':q :w :wq' },
        ]
    }
];

// Cheat Panel Functions
export function renderCheatList(cheatContent, filter = '') {
    if (!cheatContent) return;
    
    const q = filter.trim().toLowerCase();
    cheatContent.innerHTML = '';
    if (!q) {
        const grammar = document.createElement('div');
        grammar.className = 'rounded-lg border border-green-700/50 bg-black/20 p-4 space-y-3';
        grammar.innerHTML = `
            <div class="text-green-300 font-bold">${translateHint('How Vim commands are built')}</div>
            <div class="font-mono text-base text-green-200">[${translateHint('count')}] + [${translateHint('operator')}] + [${translateHint('motion or text object')}]</div>
            <div class="text-sm text-gray-300">${translateHint('A motion moves the cursor. An operator changes the text covered by a motion or text object.')}</div>
            <div class="text-sm text-gray-400">${translateHint('Example: 3dw = repeat 3 times · d deletes · w moves to the next word.')}</div>
        `;
        cheatContent.appendChild(grammar);
    }
    commandCatalog.forEach(group => {
        const matchedItems = group.items.filter(it => {
            if (!q) return true;
            const fields = [it.key, it.type, lessonCommandExplanation(it)];
            return fields.some(value => value.toLowerCase().includes(q) || translateHint(value).toLowerCase().includes(q));
        });
        if (matchedItems.length === 0) return;
        const section = document.createElement('div');
        section.innerHTML = `<div class="hint-category">${translateHint(group.category)}</div>`;
        const list = document.createElement('div');
        list.className = 'grid grid-cols-1 gap-2';
        matchedItems.forEach(it => {
            const card = document.createElement('div');
            card.className = 'hint-command-card';
            card.innerHTML = `
                <div class="min-w-0 pr-4 text-left">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                        <div class="hint-command-key">${it.key}</div>
                        <span class="rounded border border-green-700/60 bg-green-950/40 px-2 py-0.5 text-xs uppercase tracking-wide text-green-300">${translateHint(it.type)}</span>
                    </div>
                    <div class="hint-command-description">${lessonCommandExplanation(it)}</div>
                </div>
            `;
            list.appendChild(card);
        });
        section.appendChild(list);
        cheatContent.appendChild(section);
    });
}

export function openCheat(cheatOverlay, cheatPanel, cheatSearch, cheatContent) {
    if (!cheatOverlay || !cheatPanel || !cheatSearch || !cheatContent) return;
    
    cheatOverlay.classList.remove('hidden');
    cheatPanel.classList.remove('translate-x-full');
    cheatSearch.value = '';
    renderCheatList(cheatContent, '');
    cheatSearch.focus();
}

export function closeCheat(cheatOverlay, cheatPanel, editorInput) {
    if (!cheatOverlay || !cheatPanel) return;
    
    cheatOverlay.classList.add('hidden');
    cheatPanel.classList.add('translate-x-full');
    if (editorInput) editorInput.focus();
}

export function createLessonTemplate() {
    return {
        id: 'lesson-example-delete-line',
        version: 1,
        name: t('templateLessonName'),
        metadata: {
            revision: 1,
            author: t('templateAuthorName'),
            githubUsername: 'yourusername',
            created: '2026-10-09',
            difficulty: 'beginner',
            tags: ['editing'],
            estimatedTime: 30,
            order: 1,
            prerequisites: [],
            learningObjectives: [t('templateLearningObjective')]
        },
        instructions: t('templateTaskInstruction'),
        initialContent: [t('templateKeepLine'), t('templateDeleteLine'), t('templateKeepToo')],
        initialCursor: { row: 1, col: 0 },
        targetContent: [t('templateKeepLine'), t('templateKeepToo')],
        focusCommand: 'dd',
        solution: ['d', 'd']
    };
}

export function openLessonTemplateModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
}

export function closeLessonTemplateModal(modal) {
    modal?.classList.add('hidden');
}

export function downloadLessonTemplate() {
    const template = createLessonTemplate();
    const blob = new Blob([`${JSON.stringify(template, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Export command catalog for other modules
export { commandCatalog };
