import { beforeEach, describe, expect, it } from 'vitest';
import { initializeDOMReferences, renderBadges } from '../../js/ui/ui-components.js';

describe('badge rendering', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <section id="badge-section" class="hidden">
                <span id="badge-count"></span>
                <div id="badge-bar"></div>
            </section>`;
        initializeDOMReferences();
    });

    it('counts and displays only known badges', () => {
        renderBadges(new Set(['retired-badge', 'beginner']));

        expect(document.getElementById('badge-count').textContent).toBe('1');
        expect(document.querySelectorAll('#badge-bar .achievement-chip')).toHaveLength(1);
        expect(document.getElementById('badge-section').classList.contains('hidden')).toBe(false);
    });

    it('hides the section when every saved badge is unknown', () => {
        renderBadges(new Set(['retired-badge']));

        expect(document.getElementById('badge-section').classList.contains('hidden')).toBe(true);
    });
});
