import { describe, it, expect, beforeEach } from 'vitest';
import { initializeDOMReferences, updateSessionCommand, updateStatusBar } from '../../js/ui/ui-components.js';
import { initializeLanguage } from '../../js/utils/i18n.js';

describe('session command', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = `
            <span id="session-command">./train</span>
            <button id="challenge-toggle">./practice</button>
        `;
        initializeLanguage(() => {});
    });

    it('updates terminal commands when the selected language changes', () => {
        document.body.insertAdjacentHTML('beforeend', '<select id="language-select"><option value="en">EN</option><option value="ru">RU</option></select><button id="cheat-toggle" data-i18n="cheatsCommand"></button>');
        initializeLanguage(() => updateSessionCommand(true));
        const selector = document.getElementById('language-select');
        selector.value = 'ru';
        selector.dispatchEvent(new Event('change'));

        expect(document.getElementById('session-command').textContent).toBe('./практика');
        expect(document.getElementById('challenge-toggle').textContent).toBe('./обучение');
        expect(document.getElementById('cheat-toggle').textContent).toBe('./справочник');
        updateSessionCommand(false);
        expect(document.getElementById('session-command').textContent).toBe('./обучение');
        expect(document.getElementById('challenge-toggle').textContent).toBe('./практика');
    });

    it('shows the active training mode', () => {
        updateSessionCommand(true);
        expect(document.getElementById('session-command').textContent).toBe('./practice');
        expect(document.getElementById('challenge-toggle').textContent).toBe('./train');
        expect(document.getElementById('challenge-toggle').getAttribute('aria-label')).toBe('Return to training');

        updateSessionCommand(false);
        expect(document.getElementById('session-command').textContent).toBe('./train');
        expect(document.getElementById('challenge-toggle').textContent).toBe('./practice');
        expect(document.getElementById('challenge-toggle').getAttribute('aria-label')).toBe('Open practice arena');
    });

    it('renders a compact Vim status line without XP or combo', () => {
        document.body.innerHTML = '<div id="status-bar"></div>';
        initializeDOMReferences();
        updateStatusBar('NORMAL', false, '', 'forward', [], -1, '', { row: 2, col: 4 }, 6, 110);

        const status = document.getElementById('status-bar').textContent;
        expect(status).toContain('NORMAL');
        expect(status).not.toContain('Lesson');
        expect(status).toContain('Ln 3, Col 5');
        expect(status).not.toContain('XP');
        expect(status).not.toContain('Combo');
    });
});
