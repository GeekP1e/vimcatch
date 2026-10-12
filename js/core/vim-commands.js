// VimCatch Game - Vim Command Handling

import {
    getContent, getCursor, getMode, getCurrentLevel, getVisualSelection, setVisualAnchor, getVisualLinewise, setVisualLinewise,
    getCommandHistory, getYankedLine, getReplacePending, getCountBuffer,
    getUsedUndo, getSearchMode, getSearchQuery,
    getLastSearchQuery, getLastSearchDirection, getSearchMatches, getCurrentMatchIndex,
    getNavCountSinceSearch, getLevelSessionId, pushUndo, isEscapeKey, setMode,
    setSearchMode, setCursorRow, setCursorCol, setContent,
    setYankedLine, setReplacePending, setUsedUndo, setUsedRedoAfterUndo,
    setUsedSearchInLevel, setNavCountSinceSearch, setCurrentMatchIndex, setSearchMatches,
    setLastSearchQuery, setLastSearchDirection, setSearchQuery, updateContentLine,
    removeContentLine, insertContentLine, addContentLine, appendCommandHistory,
    appendCommandLog, clearCommandHistory, clearCommandLog, popUndo, popRedo,
    pushRedo, pushUndoState, setCountBuffer, setLastExCommand,
    addPracticedCommand, setOpenedFile, getChallengeMode, setCommandHistory, setCommandLog, getCommandLog
} from './game-state.js';

import { levels } from '../lessons/levels.js';
import { updateStatusBar } from '../ui/ui-components.js';

// A mistyped count must never schedule an unbounded synchronous loop.
const MAX_REPEAT = 1000;
const commandCount = value => Math.min(MAX_REPEAT, Math.max(1, parseInt(value, 10) || 1));

// Utility function for repeating actions
const repeat = (count, action) => {
    for (let i = 0; i < count; i++) {
        action();
    }
};

// Check if character is a word character
const isWordChar = (char) => /\w/.test(char);

const macroRegisters = new Map();
let recordingRegister = null;
let recordedKeys = [];
let awaitingRecordRegister = false;
let awaitingReplayRegister = false;
let lastReplayedRegister = null;
let replayDepth = 0;
let macroSessionId = -1;
let lastChangeKeys = [];
let replayingLastChange = false;

const resetMacroStateForNewSession = () => {
    const sessionId = getLevelSessionId();
    if (macroSessionId === sessionId) return;

    macroRegisters.clear();
    recordingRegister = null;
    recordedKeys = [];
    awaitingRecordRegister = false;
    awaitingReplayRegister = false;
    lastReplayedRegister = null;
    replayDepth = 0;
    lastChangeKeys = [];
    replayingLastChange = false;
    macroSessionId = sessionId;
};

const replayMacro = (register) => {
    const keys = macroRegisters.get(register);
    if (!keys || replayDepth >= 10) return;

    lastReplayedRegister = register;
    replayDepth++;
    try {
        keys.forEach((key) => {
            const event = { key, preventDefault() {}, ctrlKey: false };
            if (getMode() === 'NORMAL') handleNormalMode(event);
            else if (getMode() === 'VISUAL') handleVisualMode(event);
            else handleInsertMode(event);
        });
    } finally {
        replayDepth--;
    }
};

// Handle Normal Mode Commands
export function handleNormalMode(e) {
    e.preventDefault();
    resetMacroStateForNewSession();
    const key = e.key;
    const ctrlKey = e.ctrlKey;

    const supportedCtrlKey = ctrlKey && !e.altKey && !e.metaKey && key === 'r' && !getReplacePending();
    if ((ctrlKey || e.altKey || e.metaKey) && !isEscapeKey(e) && !supportedCtrlKey) return;

    // The character after r is literal, including digits and command keys.
    // Consume it before counts, search, macros, and dot-repeat.
    if (getReplacePending()) {
        if (['Shift', 'Control', 'Alt', 'Meta'].includes(key)) return;
        if (recordingRegister && replayDepth === 0) recordedKeys.push(key);
        if (isEscapeKey(e) || key.length === 1) {
            if (!isEscapeKey(e)) {
                const cursor = getCursor();
                const line = getContent()[cursor.row];
                const count = commandCount(getCountBuffer());
                if (cursor.col + count <= line.length) {
                    pushUndo();
                    updateContentLine(cursor.row, line.slice(0, cursor.col) + key.repeat(count) + line.slice(cursor.col + count));
                    setCursorCol(cursor.col + count - 1);
                    if (!replayingLastChange) lastChangeKeys = [...(count > 1 ? String(count) : ''), 'r', key];
                }
            }
            setReplacePending(false);
            setCountBuffer('');
            clearCommandHistory();
            clearCommandLog();
        }
        return;
    }

    if (isEscapeKey(e)) {
        setCountBuffer('');
        clearCommandHistory();
        clearCommandLog();
        awaitingRecordRegister = false;
        awaitingReplayRegister = false;
        return;
    }

    if (key === '.' && lastChangeKeys.length && !replayingLastChange) {
        replayingLastChange = true;
        try {
            lastChangeKeys.forEach(changeKey => handleNormalMode({
                key: changeKey, preventDefault() {}, ctrlKey: false, altKey: false, shiftKey: false
            }));
        } finally {
            replayingLastChange = false;
        }
        return;
    }

    const exCommandStart = getCommandHistory().lastIndexOf(':');
    if (exCommandStart !== -1) {
        if (isEscapeKey(e)) {
            clearCommandHistory();
            clearCommandLog();
        } else if (key === 'Backspace') {
            setCommandHistory(getCommandHistory().slice(0, -1));
            setCommandLog(getCommandLog().slice(0, -1));
        } else if (key === 'Enter') {
            const cmd = getCommandHistory().slice(exCommandStart + 1).trim();
            const filename = cmd.match(/^e\s+(.+)$/)?.[1];
            const fileContent = !getChallengeMode() && filename
                ? levels[getCurrentLevel()]?.files?.[filename]
                : null;
            if (Array.isArray(fileContent) && fileContent.length > 0) {
                setContent(fileContent);
                setCursorRow(0);
                setCursorCol(0);
                setOpenedFile(filename);
            }
            setLastExCommand(cmd);
            clearCommandHistory();
            clearCommandLog();
        } else if (key.length === 1) {
            appendCommandHistory(key);
            appendCommandLog(key);
        }
        return;
    }

    if (awaitingRecordRegister) {
        awaitingRecordRegister = false;
        if (/^[a-z0-9]$/i.test(key)) {
            recordingRegister = key.toLowerCase();
            recordedKeys = [];
        }
        return;
    }

    if (awaitingReplayRegister) {
        awaitingReplayRegister = false;
        const register = key === '@' ? lastReplayedRegister : key.toLowerCase();
        if (register) replayMacro(register);
        return;
    }

    if (recordingRegister && replayDepth === 0) {
        if (key === 'q') {
            macroRegisters.set(recordingRegister, [...recordedKeys]);
            recordingRegister = null;
            recordedKeys = [];
            return;
        }
        recordedKeys.push(key);
    } else if (key === 'q') {
        awaitingRecordRegister = true;
        return;
    }

    if (key === '@') {
        awaitingReplayRegister = true;
        return;
    }
    
    // Get current state
    let content = getContent();
    let cursor = getCursor();
    let mode = getMode();
    let commandHistory = getCommandHistory();
    let countBuffer = getCountBuffer();
    let lastSearchQuery = getLastSearchQuery();
    let lastSearchDirection = getLastSearchDirection();
    let searchMatches = getSearchMatches();
    let currentMatchIndex = getCurrentMatchIndex();
    let navCountSinceSearch = getNavCountSinceSearch();
    let yankedLine = getYankedLine();
    let usedUndo = getUsedUndo();
    
    // Count buffer
    if (/^[0-9]$/.test(key)) {
        if (!(key === '0' && countBuffer === '')) {
            setCountBuffer(String(commandCount(countBuffer + key)));
            appendCommandLog(key);
            return;
        }
    }
    
    // Enter search mode
    if (key === '/' || key === '?') {
        setSearchMode(true);
        setSearchQuery('');
        setLastSearchDirection(key === '?' ? 'backward' : 'forward');
        setMode('NORMAL');
        addPracticedCommand(key === '?' ? 'search_backward' : 'search_forward');
        return;
    }

    // n / N navigation for last search
    if ((key === 'n' || key === 'N') && lastSearchQuery) {
        const forward = (key === 'n') ? (lastSearchDirection === 'forward') : (lastSearchDirection === 'backward');
        if (searchMatches.length === 0) {
            return;
        }
        if (currentMatchIndex === -1) setCurrentMatchIndex(0);
        if (forward) {
            setCurrentMatchIndex((currentMatchIndex + 1) % searchMatches.length);
        } else {
            setCurrentMatchIndex((currentMatchIndex - 1 + searchMatches.length) % searchMatches.length);
        }
        const m = searchMatches[getCurrentMatchIndex()];
        setCursorRow(m.row);
        setCursorCol(Math.max(0, m.start));
        setNavCountSinceSearch(navCountSinceSearch + 1);
        addPracticedCommand(key === 'n' ? 'search_next' : 'search_previous');
        return;
    }

    // Redo (Ctrl+r) should be handled before any other 'r' logic
    if (key === 'r' && ctrlKey) {
        const next = popRedo();
        if (next) {
            pushUndoState({ content: [...content], cursor: { ...cursor }, mode, yankedLine });
            setContent(next.content);
            setCursorRow(next.cursor.row);
            setCursorCol(next.cursor.col);
            setMode(next.mode);
            setYankedLine(next.yankedLine);
        }
        if (next && usedUndo) {
            setUsedRedoAfterUndo(true);
        }
        return;
    }

    // Handle Ex commands on Enter: parse from last ':'
    if (key === 'Enter') {
        const idx = commandHistory.lastIndexOf(':');
        if (idx !== -1) {
            const cmd = commandHistory.slice(idx + 1).trim();
            setLastExCommand(cmd);
        }
        clearCommandHistory();
        clearCommandLog();
        return;
    }

    // Start single-char replace immediately so it doesn't get logged in command history
    if (key === 'r') {
        setReplacePending(true);
        clearCommandHistory();
        clearCommandLog();
        return;
    }

    if ((key === 'v' || key === 'V') && !ctrlKey) {
        setVisualAnchor(cursor);
        setVisualLinewise(key === 'V');
        setMode('VISUAL');
        setCountBuffer('');
        clearCommandHistory();
        clearCommandLog();
        return;
    }


    
    // Append to command history FIRST for compound command detection
    if (key.length === 1 && key !== 'Shift' && key !== 'Control' && key !== 'Alt') {
        appendCommandHistory(key);
        appendCommandLog(key);
    }

    // Get FRESH command history after updating it
    const freshCommandHistory = getCommandHistory();

    // Operator + inclusive motion: do not run the motion a second time.
    const operatorMotion = freshCommandHistory.match(/([dc])([e$])$/);
    if (operatorMotion) {
        const [, operator, motion] = operatorMotion;
        const line = content[cursor.row];
        let end = line.length;
        if (motion === 'e') {
            let pos = cursor.col;
            const count = commandCount(countBuffer);
            for (let i = 0; i < count; i++) {
                if (pos < line.length - 1) pos++;
                while (pos < line.length && /\s/.test(line[pos])) pos++;
                const word = isWordChar(line[pos]);
                while (pos < line.length - 1 && !/\s/.test(line[pos + 1]) && isWordChar(line[pos + 1]) === word) pos++;
            }
            end = Math.min(line.length, pos + 1);
        }
        pushUndo();
        updateContentLine(cursor.row, line.slice(0, cursor.col) + line.slice(end));
        setMode(operator === 'c' ? 'INSERT' : 'NORMAL');
        const length = getContent()[cursor.row].length;
        setCursorCol(Math.min(cursor.col, operator === 'c' ? length : Math.max(0, length - 1)));
        setCountBuffer('');
        clearCommandHistory();
        clearCommandLog();
        return;
    }

    // Check compound commands FIRST (after command history is updated)
    if (freshCommandHistory.endsWith('dd')) {
        pushUndo();
        const count = commandCount(countBuffer);
        const deletedLines = getContent().slice(cursor.row, cursor.row + count);
        for (let i = 0; i < deletedLines.length; i++) {
            removeContentLine(cursor.row);
        }
        if (getContent().length === 0) addContentLine("");
        setYankedLine(deletedLines.length === 1 ? deletedLines[0] : deletedLines);
        setCursorRow(Math.min(cursor.row, getContent().length - 1));
        setCursorCol(0);
        if (!replayingLastChange) lastChangeKeys = [...(count > 1 ? String(count) : ''), 'd', 'd'];
        setCountBuffer('');
        clearCommandHistory();
        clearCommandLog();
        return; // Exit early after processing compound command
    } else if (freshCommandHistory.endsWith('dw')) {
        pushUndo();
        const count = commandCount(countBuffer);
        for (let i = 0; i < count; i++) {
            // Fresh read per iteration — see TD-4b note on 'x'
            let line = getContent()[cursor.row];
            let start = cursor.col;
            let endOfWord = line.substring(start).search(/\s|$/);
            if (endOfWord === -1) { endOfWord = line.length; } else { endOfWord += start; }
            let startOfNextWord = line.substring(endOfWord).search(/\S/);
            if (startOfNextWord === -1) { startOfNextWord = line.length; } else { startOfNextWord += endOfWord; }
            updateContentLine(cursor.row, line.slice(0, start) + line.slice(startOfNextWord));
        }
        setCountBuffer('');
        clearCommandHistory();
        clearCommandLog();
        return; // Exit early after processing compound command
    } else if (freshCommandHistory.endsWith('diw')) {
        pushUndo();
        let line = content[cursor.row];
        if (line.length > 0) {
            const isWordChar = (c) => /\w/.test(c);
            const startIsWord = isWordChar(line[cursor.col]);
            let start = cursor.col;
            while (start > 0 && isWordChar(line[start - 1]) === startIsWord && line[start - 1] !== ' ') {
                start--;
            }
            let end = cursor.col;
            while (end < line.length && isWordChar(line[end]) === startIsWord && line[end] !== ' ') {
                end++;
            }
            // diw doesn't delete trailing space unless it's just spaces, but basic implementation:
            updateContentLine(cursor.row, line.slice(0, start) + line.slice(end));
            setCursorCol(Math.min(start, content[cursor.row].length > 0 ? content[cursor.row].length - 1 : 0));
        }
        setCountBuffer('');
        clearCommandHistory();
        clearCommandLog();
        return;
    } else if (freshCommandHistory.endsWith('ci"') || freshCommandHistory.endsWith("ci'")) {
        const quote = freshCommandHistory.at(-1);
        const line = content[cursor.row];
        const openingQuote = line.lastIndexOf(quote, cursor.col);
        const closingQuote = line.indexOf(quote, Math.max(cursor.col + 1, openingQuote + 1));
        if (openingQuote !== -1 && closingQuote !== -1 && openingQuote < closingQuote) {
            pushUndo();
            updateContentLine(cursor.row, line.slice(0, openingQuote + 1) + line.slice(closingQuote));
            setCursorCol(openingQuote + 1);
            setMode('INSERT');
        }
        setCountBuffer('');
        clearCommandHistory();
        clearCommandLog();
        return;
    }

    // Get FRESH count buffer value right before movement commands
    const countBufferValue = getCountBuffer();
    const count = commandCount(countBufferValue);
    
    // Movement
    if (key === 'h') {
        addPracticedCommand('h_left');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.col > 0) setCursorCol(currentCursor.col - 1); 
        });
    }
    if (key === 'l') {
        addPracticedCommand('l_right');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.col < content[currentCursor.row].length - 1) setCursorCol(currentCursor.col + 1); 
        });
    }
    if (key === 'k') {
        addPracticedCommand('k_up');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.row > 0) setCursorRow(currentCursor.row - 1); 
        });
    }
    if (key === 'j') {
        addPracticedCommand('j_down');
        repeat(count, () => { 
            const currentCursor = getCursor();
            if (currentCursor.row < content.length - 1) setCursorRow(currentCursor.row + 1); 
        });
    }
    if (key === '0') { setCursorCol(0); }
    if (key === '$') { const line = content[cursor.row]; setCursorCol(Math.max(0, line.length - 1)); }

    // Word movement
    // Avoid moving on 'w' when it's part of operators like 'dw' or 'cw'
    if (key === 'w' && !(freshCommandHistory.endsWith('dw') || freshCommandHistory.endsWith('cw') || freshCommandHistory.endsWith('diw') || freshCommandHistory.endsWith('ciw'))) {
        addPracticedCommand('w_word_forward');
        repeat(count, () => {
            // Get FRESH cursor position for each iteration
            const currentCursor = getCursor();
            const line = content[currentCursor.row];
            const match = line.substring(currentCursor.col).match(/\s\S/);
            if (match) {
                setCursorCol(currentCursor.col + match.index + 1);
            } else if (currentCursor.row < content.length - 1) {
                setCursorRow(currentCursor.row + 1);
                setCursorCol(0);
            }
        });
    }
    if (key === 'b') {
        addPracticedCommand('b_word_backward');
        repeat(count, () => {
            const currentCursor = getCursor();
            const line = content[currentCursor.row];
            const sub = line.substring(0, currentCursor.col).trimEnd();
            const lastSpace = sub.lastIndexOf(' ');
            setCursorCol(lastSpace !== -1 ? lastSpace + 1 : 0);
        });
    }
    if (key === 'e') {
        repeat(count, () => {
            const currentCursor = getCursor();
            const line = content[currentCursor.row];
            let i = currentCursor.col;
            if (i < line.length - 1) { i++; }
            while (i < line.length && !isWordChar(line[i])) { i++; }
            while (i < line.length - 1 && isWordChar(line[i + 1])) { i++; }
            if (isWordChar(line[i])) { setCursorCol(i); }
        });
    }

    // Line jumps
    if (freshCommandHistory.endsWith('gg')) {
        setCursorRow(0);
        setCursorCol(0);
        clearCommandHistory();
        clearCommandLog();
    }
    if (key === 'G') {
        if (countBuffer) {
            const lineNum = commandCount(countBuffer);
            setCursorRow(Math.min(content.length - 1, lineNum - 1));
            setCursorCol(0);
        } else {
            setCursorRow(content.length - 1);
            setCursorCol(0);
        }
    }

    if (key === '%') {
        const pairs = { '(': ')', '[': ']', '{': '}', ')': '(', ']': '[', '}': '{' };
        const line = content[cursor.row];
        let startCol = cursor.col;
        while (startCol < line.length && !pairs[line[startCol]]) startCol++;
        if (startCol < line.length) {
            const source = line[startCol];
            const direction = '([{'.includes(source) ? 1 : -1;
            const text = content.join('\n');
            const start = content.slice(0, cursor.row).reduce((sum, row) => sum + row.length + 1, 0) + startCol;
            let depth = 1;
            for (let pos = start + direction; pos >= 0 && pos < text.length; pos += direction) {
                if (text[pos] === source) depth++;
                else if (text[pos] === pairs[source]) depth--;
                if (depth === 0) {
                    const preceding = text.slice(0, pos).split('\n');
                    setCursorRow(preceding.length - 1);
                    setCursorCol(preceding[preceding.length - 1].length);
                    break;
                }
            }
        }
        clearCommandHistory();
        clearCommandLog();
    }

    // Mode change
    if (key === 'i' && !freshCommandHistory.endsWith('di') && !freshCommandHistory.endsWith('ci')) {
        addPracticedCommand('i_insert_mode');
        pushUndo();
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'i'
        clearCommandLog();
    }
    if (key === 'a') {
        pushUndo();
        const line = content[cursor.row];
        if (cursor.col < line.length) setCursorCol(cursor.col + 1);
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'a'
        clearCommandLog();
    }
    if (key === 'A') {
        pushUndo();
        setCursorCol(content[cursor.row].length);
        setMode('INSERT');
        clearCommandHistory();
        clearCommandLog();
    }
    if (key === 's') {
        pushUndo();
        const line = content[cursor.row];
        const count = commandCount(countBuffer);
        updateContentLine(cursor.row, line.slice(0, cursor.col) + line.slice(cursor.col + count));
        setMode('INSERT');
        clearCommandHistory();
        clearCommandLog();
    }
    if (key === 'o') {
        pushUndo();
        insertContentLine(cursor.row + 1, ""); // Insert new line BELOW current position
        setCursorRow(cursor.row + 1); // Move cursor to the new line
        setCursorCol(0);
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'o'
        clearCommandLog();
    }
    if (key === 'O') {
        pushUndo();
        insertContentLine(cursor.row, "");
        setCursorCol(0);
        setMode('INSERT');
        clearCommandHistory(); // Clear command history for standalone 'O'
        clearCommandLog();
    }
    
    // Deletion
    if (key === 'x') {
        pushUndo();
        const count = commandCount(countBuffer);
        for (let i = 0; i < count; i++) {
            // Re-read the buffer each iteration: `content` is a snapshot from
            // handler entry, so editing it repeatedly re-applies the same
            // deletion (TD-4b — '2x' deleted one char)
            const line = getContent()[cursor.row];
            if (cursor.col < line.length) {
                updateContentLine(cursor.row, line.slice(0, cursor.col) + line.slice(cursor.col + 1));
            }
        }
    }
    if (freshCommandHistory.endsWith('cw')) {
        pushUndo();
        // Change word: delete to end of current word and enter insert mode
        let line = content[cursor.row];
        let start = cursor.col;
        let endRel = line.substring(start).search(/\s|$/);
        let end = endRel === -1 ? line.length : start + endRel;
        updateContentLine(cursor.row, line.slice(0, start) + line.slice(end));
        setMode('INSERT');
        clearCommandHistory();
        clearCommandLog();
    }
    if (freshCommandHistory.endsWith('ciw')) {
        pushUndo();
        let line = content[cursor.row];
        if (line.length > 0) {
            const isWordChar = (c) => /\w/.test(c);
            const startIsWord = isWordChar(line[cursor.col]);
            let start = cursor.col;
            while (start > 0 && isWordChar(line[start - 1]) === startIsWord && line[start - 1] !== ' ') {
                start--;
            }
            let end = cursor.col;
            while (end < line.length && isWordChar(line[end]) === startIsWord && line[end] !== ' ') {
                end++;
            }
            updateContentLine(cursor.row, line.slice(0, start) + line.slice(end));
            setCursorCol(Math.min(start, content[cursor.row].length > 0 ? content[cursor.row].length - 1 : 0));
        }
        setMode('INSERT');
        clearCommandHistory();
        clearCommandLog();
    }
    if (key === 'D') {
        // Delete to end of line
        pushUndo();
        let line = content[cursor.row];
        updateContentLine(cursor.row, line.slice(0, cursor.col));
        clearCommandLog();
    }
    
    // Yank & Put
    if (freshCommandHistory.endsWith('yy')) {
        const count = commandCount(countBuffer);
        const yankedLines = content.slice(cursor.row, cursor.row + count);
        setYankedLine(yankedLines.length === 1 ? yankedLines[0] : yankedLines);
        clearCommandHistory();
        clearCommandLog();
    }
    if (['p', 'P'].includes(key) && yankedLine !== null) {
        if (yankedLine.type === 'characterwise' && !yankedLine.text) {
            setCountBuffer('');
            clearCommandHistory();
            clearCommandLog();
            return;
        }
        pushUndo();
        const count = commandCount(countBuffer);
        if (yankedLine.type === 'characterwise') {
            const line = content[cursor.row];
            const col = Math.min(line.length, cursor.col + (key === 'p' ? 1 : 0));
            const inserted = yankedLine.text.repeat(count).split('\n');
            const last = inserted.length - 1;
            const lastCol = col + inserted[0].length - 1;
            inserted[0] = line.slice(0, col) + inserted[0];
            inserted[last] += line.slice(col);
            setContent([...content.slice(0, cursor.row), ...inserted, ...content.slice(cursor.row + 1)]);
            setCursorCol(inserted.length === 1 ? Math.max(0, lastCol) : col);
        } else {
            const row = cursor.row + (key === 'p' ? 1 : 0);
            const lines = Array.isArray(yankedLine) ? yankedLine : [yankedLine];
            const inserted = Array.from({ length: count }, () => lines).flat();
            setContent([...content.slice(0, row), ...inserted, ...content.slice(row)]);
            setCursorRow(row);
            setCursorCol(Math.max(0, inserted[0].search(/\S/)));
        }
        if (!replayingLastChange) lastChangeKeys = [...(count > 1 ? String(count) : ''), key];
        clearCommandHistory();
        clearCommandLog();
    }

    // Clear operator combos when standalone keys are pressed
    if (['i','a','o','O','p','P','D'].includes(key)) {
        clearCommandLog();
    }

    // Undo / Redo
    if (key === 'u') {
        const prev = popUndo();
        if (prev) {
            pushRedo({ content: [...content], cursor: { ...cursor }, mode, yankedLine });
            setContent(prev.content);
            setCursorRow(prev.cursor.row);
            setCursorCol(prev.cursor.col);
            setMode(prev.mode);
            setYankedLine(prev.yankedLine);
        }
        if (prev) {
            setUsedUndo(true);
            setUsedRedoAfterUndo(false);
        }
        return;
    }



    // Ensure cursor is within bounds. Must evaluate FRESH state: the command
    // above may have moved the cursor or edited the buffer, and clamping the
    // entry-time snapshot corrupted valid motions (TD-4 — '0' was overwritten
    // to line end whenever the cursor sat past EOL after 'j').
    const freshContent = getContent();
    const freshCursor = getCursor();
    const row = Math.min(Math.max(freshCursor.row, 0), freshContent.length - 1);
    if (row !== freshCursor.row) setCursorRow(row);
    const lineLength = freshContent[row].length;
    let col = Math.min(Math.max(freshCursor.col, 0), lineLength);
    if (getMode() !== 'INSERT' && col === lineLength && lineLength > 0) {
        col = lineLength - 1;
    }
    if (col !== freshCursor.col) setCursorCol(col);
    
    // Reset count buffer AFTER ALL commands have been processed — but keep
    // it alive while a multi-key command is still being typed: clearing it
    // on the operator's first key made counts work only for single-key
    // commands ('2dd' deleted one line while '2x' worked — TD-4b family).
    // Compound handlers that return early clear the count themselves.
    const historyNow = getCommandHistory();
    const awaitingCompound = ['d', 'di', 'c', 'ci', 'y', 'g'].some((prefix) => historyNow.endsWith(prefix));
    if (!/^[0-9]$/.test(key) && !awaitingCompound) setCountBuffer('');
}

// Visual mode: reuse motions and operate on the inclusive selection.
export function handleVisualMode(e) {
    e.preventDefault();
    resetMacroStateForNewSession();
    if ((e.ctrlKey || e.altKey || e.metaKey) && !isEscapeKey(e)) return;
    if (!e.ctrlKey && (e.key === 'v' || e.key === 'V') && getVisualLinewise() !== (e.key === 'V')) {
        if (recordingRegister && replayDepth === 0) recordedKeys.push(e.key);
        setVisualLinewise(e.key === 'V');
        setCountBuffer('');
        clearCommandHistory();
        clearCommandLog();
        return;
    }
    if (isEscapeKey(e) || (!e.ctrlKey && ['v', 'V', 'd', 'c', 'y'].includes(e.key))) {
        const selection = getVisualSelection();
        if (recordingRegister && replayDepth === 0) recordedKeys.push(e.key);
        setMode('NORMAL');
        if (['d', 'c', 'y'].includes(e.key) && selection) {
            const content = getContent();
            const { start, end } = selection;
            if (e.key !== 'y') pushUndo();
            if (selection.linewise) {
                setYankedLine(content.slice(start.row, end.row + 1));
                if (e.key !== 'y') {
                    const remaining = [...content.slice(0, start.row), ...(e.key === 'c' ? [''] : []), ...content.slice(end.row + 1)];
                    setContent(remaining.length ? remaining : ['']);
                }
                setCursorRow(Math.min(start.row, getContent().length - 1));
                setCursorCol(0);
            } else {
                const selectedLines = content.slice(start.row, end.row + 1);
                selectedLines[selectedLines.length - 1] = selectedLines.at(-1).slice(0, end.col + 1);
                selectedLines[0] = selectedLines[0].slice(start.col);
                setYankedLine({ type: 'characterwise', text: selectedLines.join('\n') });
                const line = e.key === 'y' ? content[start.row]
                    : content[start.row].slice(0, start.col) + content[end.row].slice(end.col + 1);
                if (e.key !== 'y') setContent([...content.slice(0, start.row), line, ...content.slice(end.row + 1)]);
                setCursorRow(start.row);
                setCursorCol(Math.min(start.col, e.key === 'c' ? line.length : Math.max(0, line.length - 1)));
            }
            if (e.key === 'c') setMode('INSERT');
        }
        setCountBuffer('');
        clearCommandHistory();
        clearCommandLog();
        return;
    }
    if (!e.ctrlKey && (/^[0-9]$/.test(e.key) || ['h', 'j', 'k', 'l', 'w', 'b', 'e', '$', 'g', 'G', '%'].includes(e.key))) {
        handleNormalMode(e);
    }
}

// Handle Insert Mode Commands
export function handleInsertMode(e) {
    e.preventDefault();
    if ((e.ctrlKey || e.altKey || e.metaKey) && !isEscapeKey(e)) return;
    if (recordingRegister && replayDepth === 0) recordedKeys.push(e.key);
    const content = getContent();
    const cursor = getCursor();
    let line = content[cursor.row];
    
    if (isEscapeKey(e)) {
        setMode('NORMAL');
        if (cursor.col > 0) setCursorCol(cursor.col - 1);
    } else if (e.key === 'Backspace') {
        if (cursor.col > 0) {
            updateContentLine(cursor.row, line.slice(0, cursor.col - 1) + line.slice(cursor.col));
            setCursorCol(cursor.col - 1);
        }
    } else if (e.key.length === 1) {
        updateContentLine(cursor.row, line.slice(0, cursor.col) + e.key + line.slice(cursor.col));
        setCursorCol(cursor.col + 1);
    }
}

// Handle Search Mode Commands
export function handleSearchMode(e) {
    e.preventDefault();
    const key = e.key;

    if ((e.ctrlKey || e.altKey || e.metaKey) && !isEscapeKey(e)) return;
    
    if (isEscapeKey(e)) {
        setSearchMode(false);
        setSearchQuery('');
        return;
    }
    if (key === 'Backspace') {
        const currentQuery = getSearchQuery();
        setSearchQuery(currentQuery.slice(0, -1));
        // Update status bar to show the updated search query
        updateStatusBar(
            getMode(),
            getSearchMode(),
            getSearchQuery(),
            getLastSearchDirection(),
            getSearchMatches(),
            getCurrentMatchIndex(),
            getCommandHistory(),
            getCursor(),
            getCurrentLevel(),
            levels.length
        );
        return;
    }
    if (key === 'Enter') {
        const currentQuery = getSearchQuery();
        setLastSearchQuery(currentQuery);
        setUsedSearchInLevel(true);
        setSearchMode(false);
        setCurrentMatchIndex(-1);
        recomputeSearchMatches();
        jumpToFirstMatchFromCursor();
        setNavCountSinceSearch(0);
        return;
    }
    if (key.length === 1) {
        const currentQuery = getSearchQuery();
        setSearchQuery(currentQuery + key);
        // Update status bar to show the updated search query
        updateStatusBar(
            getMode(),
            getSearchMode(),
            getSearchQuery(),
            getLastSearchDirection(),
            getSearchMatches(),
            getCurrentMatchIndex(),
            getCommandHistory(),
            getCursor(),
            getCurrentLevel(),
            levels.length
        );
    }
}

// Search utility functions
function recomputeSearchMatches() {
    const content = getContent();
    const lastSearchQuery = getLastSearchQuery();
    
    setSearchMatches([]);
    if (!lastSearchQuery || lastSearchQuery.length === 0) return;
    
    const needle = lastSearchQuery.toLowerCase();
    const matches = [];
    
    for (let r = 0; r < content.length; r++) {
        const line = content[r];
        const lineLower = line.toLowerCase();
        let idx = 0;
        while (true) {
            const found = lineLower.indexOf(needle, idx);
            if (found === -1) break;
            matches.push({ row: r, start: found, end: found + needle.length });
            idx = found + (needle.length > 0 ? Math.max(1, needle.length) : 1);
        }
    }
    
    setSearchMatches(matches);
}

function jumpToFirstMatchFromCursor() {
    const searchMatches = getSearchMatches();
    const cursor = getCursor();
    const lastSearchDirection = getLastSearchDirection();
    
    if (searchMatches.length === 0) { 
        setCurrentMatchIndex(-1); 
        return; 
    }
    
    const startRow = cursor.row;
    const startCol = cursor.col;
    let bestIndex = -1;
    
    if (lastSearchDirection === 'forward') {
        // first match at or after cursor position scanning forward through lines
        for (let i = 0; i < searchMatches.length; i++) {
            const m = searchMatches[i];
            if (m.row < startRow) continue;
            if (m.row === startRow && m.start < startCol) continue;
            bestIndex = i; break;
        }
        if (bestIndex === -1) bestIndex = 0; // wrap
    } else {
        // first match at or before cursor scanning backward
        for (let i = searchMatches.length - 1; i >= 0; i--) {
            const m = searchMatches[i];
            if (m.row > startRow) continue;
            if (m.row === startRow && m.start > startCol) continue;
            bestIndex = i; break;
        }
        if (bestIndex === -1) bestIndex = searchMatches.length - 1; // wrap
    }
    
    setCurrentMatchIndex(bestIndex);
    const m = searchMatches[bestIndex];
    setCursorRow(m.row);
    setCursorCol(Math.max(0, m.start));
}
