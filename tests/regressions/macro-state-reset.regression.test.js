import { describe, expect, it } from 'vitest';
import { handleNormalMode } from '../../js/core/vim-commands.js';
import {
    getMode,
    resetGameState,
    resetLevelState,
    setContent,
    setCursor,
    setMode
} from '../../js/core/game-state.js';

const press = (key) => handleNormalMode({
    key,
    preventDefault() {},
    ctrlKey: false,
    altKey: false,
    shiftKey: key !== key.toLowerCase()
});

describe('Regression: macro recording state is isolated per lesson load', () => {
    it('treats a in qa as a register after reloading an interrupted recording', () => {
        resetGameState();
        setContent(['first']);
        setCursor({ row: 0, col: 0 });
        setMode('NORMAL');
        press('q');
        press('a');

        resetLevelState();
        setContent(['second']);
        setCursor({ row: 0, col: 0 });
        setMode('NORMAL');
        press('q');
        press('a');

        expect(getMode()).toBe('NORMAL');
    });
});
