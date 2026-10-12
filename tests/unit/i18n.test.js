import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeLanguage, lessonInstructions, lessonCommandExplanation, t, translateHint, practiceInstruction, practiceName, practiceDescription } from '../../js/utils/i18n.js';
import { createPracticeChallenge } from '../../js/practice/challenges.js';
import { generatedContent } from '../../js/lessons/generated-content.js';
import { commandCatalog, createLessonTemplate } from '../../js/ui/cheat-mode.js';

describe('language selection and lesson translations', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '<select id="language-select"><option value="en">EN</option><option value="ru">RU</option><option value="zh-CN">中文</option><option value="es">ES</option></select>';
    });

    it.each(['ru', 'zh-CN', 'es'])('preserves command literals in %s', locale => {
        localStorage.setItem('vimcatchLanguage', locale);
        initializeLanguage(vi.fn());
        const text = lessonInstructions({ id: 'lesson-how-to-exit-ex-commands', instructions: 'English fallback' });
        expect(text).toContain(':q');
        expect(text).not.toContain(':wq');
        expect(lessonInstructions({ id: 'lesson-save-and-quit', instructions: 'English fallback' })).toContain(':wq');
        const backwardInstruction = lessonInstructions({ id: 'lesson-word-backward-b' });
        expect(backwardInstruction).toContain('test');
        expect(backwardInstruction).toContain('compose');
        expect(backwardInstruction).toContain('4');
        expect(document.documentElement.lang).toBe(locale);
        expect(translateHint('Use jp')).not.toBe('Use jp');
        const explanation = lessonCommandExplanation({ focusCommand: 'c$' });
        expect(explanation).toContain('c');
        expect(explanation).toContain('$');
        expect(explanation).not.toContain('Esc');
    });

    it('restores English and keeps untranslated custom content intact', () => {
        initializeLanguage(vi.fn());
        expect(t('goal')).toBe('Goal');
        expect(translateHint('Use jp')).toBe('Use jp');
        expect(lessonInstructions({ id: 'lesson-custom', instructions: 'Custom instructions' })).toBe('Custom instructions');
        expect(lessonCommandExplanation({ focusCommand: 'c$' })).toContain('change operator');
        expect(lessonCommandExplanation({ focusCommand: 'i' })).toContain('INSERT');
    });

    it('translates practice and dynamically generated task values into Russian', () => {
        localStorage.setItem('vimcatchLanguage', 'ru');
        initializeLanguage(vi.fn());
        expect(t('reset')).toBe('Начать сначала');
        expect(t('beginner')).toBe('Новичок');
        expect(t('beginnerEarned')).toContain('Новичок');
        expect(t('searchmasterEarned')).toContain('Мастер поиска');
        expect(t('streakDays')).toContain('Серия');
        for (const mode of ['commands', 'weakness', 'golf']) {
            const challenge = createPracticeChallenge({ mode });
            expect(practiceName(challenge)).not.toBe(challenge.name);
            expect(practiceDescription(challenge)).not.toBe(challenge.description);
            for (const task of challenge.tasks) {
                expect(practiceInstruction(task)).toMatch(/[А-Яа-я]/);
            }
        }
        const task = { id: 'replace-quotes-1', targetBody: ['const environment = "stable";'] };
        expect(practiceInstruction(task)).toContain('stable');
        expect(practiceInstruction(task)).not.toContain('production');
    });

    it.each(['en', 'ru', 'zh-CN', 'es'])('explains every lesson command in %s', locale => {
        localStorage.setItem('vimcatchLanguage', locale);
        initializeLanguage(vi.fn());
        for (const lesson of Object.values(generatedContent.lessons)) {
            expect(lessonCommandExplanation(lesson), lesson.id).not.toBe('');
        }
    });

    it.each(['ru', 'zh-CN', 'es'])('keeps current lesson text literals in %s instructions', locale => {
        localStorage.setItem('vimcatchLanguage', locale);
        initializeLanguage(vi.fn());
        for (const lesson of Object.values(generatedContent.lessons)) {
            const translated = lessonInstructions(lesson);
            expect(translated, `${locale}: ${lesson.id}`).not.toBe(lesson.instructions);
            const literals = [...lesson.instructions.matchAll(/'([^'\n]+)'/g)]
                .flatMap(match => match[1].trim().split(/\s+/)).filter(text => text.length > 1);
            for (const literal of literals) {
                expect(translated, `${locale}: ${lesson.id}: ${literal}`).toContain(literal);
            }
        }
        expect(lessonInstructions({ id: 'lesson-word-end-e' })).toContain('4');
        expect(lessonInstructions({ id: 'lesson-search-backward' })).not.toMatch(/\bN\b/);
        expect(lessonInstructions({ id: 'lesson-inner-word-append-mix' })).not.toMatch(/\bj\b/);
    });

    it.each(['ru', 'zh-CN', 'es'])('translates every command-reference card in %s', locale => {
        initializeLanguage(vi.fn());
        const english = commandCatalog.flatMap(group => group.items.map(item => ({
            type: translateHint(item.type),
            explanation: lessonCommandExplanation(item)
        })));

        localStorage.setItem('vimcatchLanguage', locale);
        initializeLanguage(vi.fn());
        commandCatalog.flatMap(group => group.items).forEach((item, index) => {
            expect(translateHint(item.type), `${locale}: ${item.key} type`).not.toBe(english[index].type);
            expect(lessonCommandExplanation(item), `${locale}: ${item.key} explanation`).not.toBe(english[index].explanation);
        });
    });


    it.each([
        ['ru', 'Нажмите', 'Импорт урока'],
        ['zh-CN', '按 dd', '导入课程'],
        ['es', 'Pulsa dd', 'Importar lección']
    ])('localizes the lesson template and its instructions in %s', (locale, instruction, steps) => {
        localStorage.setItem('vimcatchLanguage', locale);
        initializeLanguage(vi.fn());

        expect(createLessonTemplate().instructions).toContain(instruction);
        expect(t('templateSteps')).toContain(steps);
    });
});
