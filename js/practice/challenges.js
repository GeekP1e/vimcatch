// VimCatch Game - Practice Arena

import { loadRegularLessons } from '../lessons/content-loader.js';
import * as engineState from '../core/game-state.js';
import { evaluateWinCondition } from '../lessons/win-evaluator.js';
import { golfTasks } from './golf-tasks.js';
import { timeTasks } from './time-tasks.js';

const drillLessons = loadRegularLessons().filter(lesson =>
    lesson.solution && lesson.focusCommand && !lesson.exCommands && !lesson.files
    && !lesson.focusCommand.includes('→') && !lesson.focusCommand.includes('…')
    && !lesson.requires?.some(requirement => requirement.type === 'undoThenRedo')
);

export function getPracticeCommands() {
    return [...new Set([
        ...drillLessons.flatMap(lesson => lesson.focusCommand === 'hjkl' ? ['h', 'j', 'k', 'l']
            : lesson.focusCommand === 'd$' ? ['d$', 'D'] : [lesson.focusCommand]),
        ...taskBlueprints.flatMap(task => task.commands)
    ])];
}

function createLessonDrills(count) {
    return Array.from({ length: count }, (_, index) => {
        const source = drillLessons[index % drillLessons.length];
        const serial = ++generatedTaskSerial;
        const context = `// workspace: ${['api', 'worker', 'client', 'config', 'release'][serial % 5]}-${serial}`;
        const lesson = {
            ...source,
            initialContent: [...source.initialContent, context],
            ...(source.targetContent ? { targetContent: [...source.targetContent, context] } : {})
        };
        const highlights = lesson.target ? [{
            line: lesson.initialContent[lesson.target.row],
            token: lesson.initialContent[lesson.target.row].slice(lesson.target.col).match(/^\w+/)?.[0]
                || lesson.initialContent[lesson.target.row][lesson.target.col],
            row: lesson.target.row,
            col: lesson.target.col
        }] : lesson.initialContent.flatMap((line, row) => {
            const target = lesson.targetContent?.[row] ?? (lesson.targetText?.line === row ? lesson.targetText.text : line);
            return target !== line ? [{ line, token: null }] : [];
        });
        const instruction = lesson.target
            ? 'Move to the highlighted target.' + (lesson.metadata.tags.includes('search') || lesson.name.startsWith('Search') ? ' Find it using search.' : '')
            : `Edit the highlighted text to produce:\n${(lesson.targetContent || [lesson.targetText?.text]).filter(line => line !== undefined).join('\n')}`;
        const start = lesson.initialCursor || { row: 0, col: 0 };
        const solution = lesson.target ? lesson.solution
            : [...Array(start.row).fill('j'), '0', ...Array(start.col).fill('l'), ...lesson.solution];
        return {
            ...lesson,
            id: `drill-${lesson.id}-${serial}`,
            commands: lesson.focusCommand === 'hjkl' ? ['h', 'j', 'k', 'l']
                : lesson.focusCommand === 'd$' ? ['d$', 'D'] : [lesson.focusCommand],
            categories: lesson.target ? ['motions'] : ['operators'],
            kind: lesson.target ? 'motion' : 'edit',
            instruction,
            highlights,
            initialCursor: lesson.target ? lesson.initialCursor : { row: 0, col: 0 },
            solution,
            optimalKeys: solution.length,
            validation: () => evaluateWinCondition({
                content: engineState.getContent(), cursor: engineState.getCursor(), mode: engineState.getMode(),
                usedSearchInLevel: engineState.getUsedSearchInLevel(),
                navCountSinceSearch: engineState.getNavCountSinceSearch(),
                lastSearchQuery: engineState.getLastSearchQuery(), lastSearchDirection: engineState.getLastSearchDirection()
            }, lesson).won
        };
    });
}

const exactBuffer = (expected) => (gameState) => {
    const content = gameState.getContent();
    return gameState.getMode() === 'NORMAL'
        && content.length === expected.length
        && content.every((line, index) => line === expected[index]);
};

const taskBlueprints = [
    {
        id: 'delete-word', functionName: 'initializeCache', kind: 'delete', commands: ['dw'], categories: ['motions', 'operators'], optimalKeys: 2,
        instruction: "Remove the highlighted obsolete word 'legacy'.",
        hint: 'd is the delete operator; w supplies the range to the next word.', cursorLine: 0, cursorToken: 'legacy',
        initialBody: ['const cache = legacy createMemoryCache();', 'cache.connect();', 'cache.warmUp();', 'metrics.track(cache);', 'return cache;'],
        targetBody: ['const cache = createMemoryCache();', 'cache.connect();', 'cache.warmUp();', 'metrics.track(cache);', 'return cache;']
    },
    {
        id: 'delete-line', functionName: 'configureApplication', kind: 'delete', commands: ['dd'], categories: ['operators'], optimalKeys: 2,
        instruction: 'Delete the highlighted deprecated middleware line.',
        hint: 'Repeating the d operator as dd selects the whole current line.', cursorLine: 1, cursorToken: 'legacyAuth',
        initialBody: ['const app = createApp();', 'app.use(legacyAuth());', 'app.use(requestLogger());', 'app.use(errorHandler());', 'app.listen(port);', 'return app;'],
        targetBody: ['const app = createApp();', 'app.use(requestLogger());', 'app.use(errorHandler());', 'app.listen(port);', 'return app;']
    },
    {
        id: 'replace-quotes', functionName: 'loadEnvironment', kind: 'replace', commands: ['ci"'], categories: ['operators', 'textObjects'], optimalKeys: 14,
        instruction: 'Replace the highlighted quoted value with production.',
        hint: 'c is the change operator; i" selects everything inside the surrounding double quotes.', cursorLine: 0, cursorToken: 'staging',
        initialBody: ['const environment = "staging";', 'const config = loadConfig(environment);', 'validateConfig(config);', 'connectDatabase(config);', 'return config;'],
        targetBody: ['const environment = "production";', 'const config = loadConfig(environment);', 'validateConfig(config);', 'connectDatabase(config);', 'return config;']
    },
    {
        id: 'move-line', functionName: 'deployRelease', kind: 'move', commands: ['dd', 'j', 'p'], categories: ['motions', 'operators'], optimalKeys: 4,
        instruction: 'Move the highlighted notifyCustomers() line below runSmokeTests().',
        hint: 'dd cuts the line, j moves down, and p puts it below the cursor.', cursorLine: 0, cursorToken: 'notifyCustomers',
        initialBody: ['notifyCustomers();', 'deployRelease();', 'runSmokeTests();', 'publishMetrics();', 'return releaseId;'],
        targetBody: ['deployRelease();', 'runSmokeTests();', 'notifyCustomers();', 'publishMetrics();', 'return releaseId;']
    },
    {
        id: 'repeat-delete', functionName: 'startServer', kind: 'repeat', commands: ['dd', '.'], categories: ['operators'], optimalKeys: 3,
        instruction: 'Delete both highlighted debug lines.',
        hint: 'The dot command repeats the last text-changing command at the current cursor position.', cursorLine: 0, cursorToken: 'console',
        initialBody: ['console.debug("boot");', 'console.debug("routes");', 'loadConfig();', 'connectDatabase();', 'registerRoutes();', 'startServer();', 'return server;'],
        targetBody: ['loadConfig();', 'connectDatabase();', 'registerRoutes();', 'startServer();', 'return server;']
    },
    {
        id: 'edit-series', functionName: 'bootApplication', kind: 'series', commands: ['dd', 'ci"'], categories: ['motions', 'operators', 'textObjects'], optimalKeys: 20,
        instruction: 'Delete the highlighted debug line and replace the highlighted environment value with production.',
        hint: 'After dd, move inside the quoted value, then use ci".', cursorLine: 1, cursorToken: 'logger',
        initialBody: ['const debug = true;', 'logger.debug("boot");', 'const env = "staging";', 'const app = createApp(env);', 'app.start();', 'return app;'],
        targetBody: ['const debug = true;', 'const env = "production";', 'const app = createApp(env);', 'app.start();', 'return app;']
    }
];

const variantProfiles = [
    { value: 'cache', factory: 'createMemoryCache', obsolete: 'legacy', from: 'staging', to: 'production', notify: 'notifyCustomers', deploy: 'deployRelease', verify: 'runSmokeTests', firstLog: 'boot', secondLog: 'routes' },
    { value: 'session', factory: 'createSessionStore', obsolete: 'deprecated', from: 'development', to: 'production', notify: 'sendReleaseEmail', deploy: 'publishBuild', verify: 'verifyDeployment', firstLog: 'config', secondLog: 'database' },
    { value: 'queue', factory: 'createJobQueue', obsolete: 'outdated', from: 'preview', to: 'stable', notify: 'postReleaseMessage', deploy: 'promoteVersion', verify: 'checkServiceHealth', firstLog: 'workers', secondLog: 'scheduler' },
    { value: 'client', factory: 'createApiClient', obsolete: 'unsafe', from: 'sandbox', to: 'live', notify: 'announceDeployment', deploy: 'uploadBundle', verify: 'executeSmokeTests', firstLog: 'plugins', secondLog: 'handlers' },
    { value: 'registry', factory: 'createServiceRegistry', obsolete: 'old', from: 'canary', to: 'production', notify: 'publishReleaseNotes', deploy: 'rolloutServices', verify: 'validateEndpoints', firstLog: 'services', secondLog: 'endpoints' }
];

let generatedTaskSerial = 0;

function replaceTokens(value, replacements) {
    return replacements.reduce((result, [from, to]) => result.split(from).join(to), value);
}

function createTaskVariant(blueprint, variantIndex) {
    const profile = variantProfiles[variantIndex % variantProfiles.length];
    const serial = ++generatedTaskSerial;
    const replacements = [
        ['createMemoryCache', profile.factory], ['cache', profile.value], ['legacy', profile.obsolete],
        ['staging', profile.from], ['production', profile.to],
        ['notifyCustomers', profile.notify], ['deployRelease', profile.deploy], ['runSmokeTests', profile.verify],
        ['"boot"', `"${profile.firstLog}-${serial}"`], ['"routes"', `"${profile.secondLog}-${serial}"`]
    ];
    const replace = value => replaceTokens(value, replacements);
    return {
        ...blueprint,
        id: `${blueprint.id}-${serial}`,
        functionName: `${blueprint.functionName}${serial}`,
        instruction: replace(blueprint.instruction),
        hint: replace(blueprint.hint),
        cursorToken: replace(blueprint.cursorToken),
        initialBody: blueprint.initialBody.map(replace),
        targetBody: blueprint.targetBody.map(replace)
    };
}

function generateTaskBank(count) {
    return Array.from({ length: count }, (_, index) => {
        const blueprint = createTaskVariant(taskBlueprints[index % taskBlueprints.length], index);
        const wrapFunction = body => [`function ${blueprint.functionName}() {`, ...body.map(line => `  ${line}`), '}'];
        const initialContent = wrapFunction(blueprint.initialBody);
        const targetContent = wrapFunction(blueprint.targetBody);
        const highlights = blueprint.initialBody.flatMap((line, index) => {
            if (blueprint.kind === 'move') return index === blueprint.cursorLine
                ? [{ line: initialContent[index + 1], token: null }] : [];
            if (blueprint.targetBody.includes(line)) return [];
            const token = blueprint.kind === 'replace' || (blueprint.kind === 'series' && line.includes('const env'))
                ? line.match(/"([^"]+)"/)?.[1]
                : blueprint.id.startsWith('delete-word-') ? blueprint.cursorToken : null;
            return [{ line: initialContent[index + 1], token }];
        });
        return {
            ...blueprint,
            language: 'javascript',
            initialContent,
            targetContent,
            highlights,
            optimalKeys: blueprint.optimalKeys + blueprint.cursorLine + 1,
            initialCursor: { row: 0, col: 0 },
            validation: exactBuffer(targetContent)
        };
    });
}

const modeLabels = {
    time: ['Time Attack', 'Solve as many editing tasks as possible before time runs out.'],
    commands: ['Command Drill', 'Practice tasks centered on the selected command family.'],
    weakness: ['Weakness Training', 'Tasks are selected from your least accurate Vim category.'],
    golf: ['Vim Golf', 'Finish each task with as few keystrokes as possible.']
};

let practiceConfig = { mode: 'time', duration: 60, commands: ['dw', 'dd', 'ci"'] };
let practiceMetrics = createEmptyMetrics();

function createEmptyMetrics() {
    return {
        keystrokes: 0, taskStartKeys: 0, optimalKeys: 0, deviation: 0,
        accuracy: 100, streak: 0, bestStreak: 0, completed: 0,
        categories: {
            motions: { completed: 0, attempts: 0 },
            operators: { completed: 0, attempts: 0 },
            textObjects: { completed: 0, attempts: 0 }
        }
    };
}

function loadStoredCategories() {
    try {
        const stored = JSON.parse(localStorage.getItem('vim-practice-progress') || 'null');
        return stored?.categories || null;
    } catch {
        return null;
    }
}

function saveStoredCategories() {
    try {
        localStorage.setItem('vim-practice-progress', JSON.stringify({ categories: practiceMetrics.categories }));
    } catch {
        // Metrics remain available for the current session.
    }
}

function weakestCategory() {
    const stored = loadStoredCategories();
    if (!stored) return 'operators';
    return ['motions', 'operators', 'textObjects'].reduce((weakest, key) => {
        const score = stored[key]?.attempts ? stored[key].completed / stored[key].attempts : 0;
        const weakestScore = stored[weakest]?.attempts ? stored[weakest].completed / stored[weakest].attempts : 0;
        return score < weakestScore ? key : weakest;
    }, 'motions');
}

function tasksForConfig(config) {
    const requestedCount = config.mode === 'time' ? Number(config.duration) : 12;
    if (config.mode === 'time') {
        const pool = [...timeTasks];
        for (let index = pool.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
        }
        return Array.from({ length: requestedCount }, (_, index) => {
            const task = pool[index % pool.length];
            return {
                ...task, initialCursor: { row: 0, col: 0 }, categories: ['operators'],
                optimalKeys: task.solution.length, validation: exactBuffer(task.targetContent)
            };
        });
    }
    const taskBank = generateTaskBank(requestedCount * taskBlueprints.length);
    if (config.mode === 'commands') {
        const selectedCommands = config.commands?.length ? config.commands : taskBlueprints.flatMap(task => task.commands);
        const existingCommands = new Set(taskBlueprints.flatMap(task => task.commands));
        const drills = createLessonDrills(requestedCount * drillLessons.length)
            .filter(task => task.commands.some(command => selectedCommands.includes(command) && !existingCommands.has(command)));
        const existing = taskBank.filter(task => task.commands.some(command => selectedCommands.includes(command)));
        return Array.from({ length: Math.max(existing.length, drills.length) }, (_, index) =>
            [existing[index], drills[index]].filter(Boolean)).flat();
    }
    if (config.mode === 'weakness') {
        const category = weakestCategory();
        return taskBank.filter(task => task.categories.includes(category));
    }
    if (config.mode === 'golf') return taskBank.filter(task => ['delete', 'replace', 'move'].includes(task.kind));
    return taskBank;
}

export function configurePractice(nextConfig = {}) {
    practiceConfig = { ...practiceConfig, ...nextConfig };
    return { ...practiceConfig };
}

export function getPracticeConfig() {
    return { ...practiceConfig };
}

let previousOpeningTask = null;
const taskSignature = task => `${task.instruction}\n${task.initialContent.slice(task.functionName ? 1 : 0).join('\n')}`;

export function createPracticeChallenge(config = practiceConfig) {
    const resolved = { ...practiceConfig, ...config };
    const [name, description] = modeLabels[resolved.mode] || modeLabels.time;
    if (resolved.mode === 'golf') {
        const tasks = golfTasks.map(task => ({
            ...task, golf: true, initialCursor: { row: 0, col: 0 }, categories: [],
            instruction: task.instructionKey, optimalKeys: task.solution.length,
            validation: exactBuffer(task.targetContent)
        }));
        return { name, description, mode: 'golf', timeLimit: null, tasks, initialContent: tasks[0].initialContent };
    }
    const selectedTasks = tasksForConfig(resolved);
    for (let index = resolved.mode === 'time' ? 0 : selectedTasks.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [selectedTasks[index], selectedTasks[swapIndex]] = [selectedTasks[swapIndex], selectedTasks[index]];
    }
    const differentIndex = selectedTasks.findIndex(task => taskSignature(task) !== previousOpeningTask);
    if (differentIndex > 0) {
        [selectedTasks[0], selectedTasks[differentIndex]] = [selectedTasks[differentIndex], selectedTasks[0]];
    }
    if (selectedTasks[0]) previousOpeningTask = taskSignature(selectedTasks[0]);
    const sessionLength = resolved.mode === 'time' ? Number(resolved.duration) : 12;
    const tasks = selectedTasks.slice(0, sessionLength);
    return {
        name, description, mode: resolved.mode,
        timeLimit: resolved.mode === 'time' ? Number(resolved.duration) : null,
        tasks,
        initialContent: tasks[0]?.initialContent || ['// No tasks available']
    };
}

export const challenges = ['time', 'golf']
    .map(mode => createPracticeChallenge({ ...practiceConfig, mode }));

export function resetPracticeMetrics() {
    practiceMetrics = createEmptyMetrics();
}

export function recordPracticeKey(event) {
    if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) practiceMetrics.keystrokes += 1;
}

export function recordTaskCompletion(task) {
    const actual = practiceMetrics.keystrokes - practiceMetrics.taskStartKeys;
    if (task.golf) saveGolfResult(task.id, actual);
    const optimal = task.optimalKeys || actual;
    const deviation = Math.max(0, actual - optimal);
    practiceMetrics.completed += 1;
    practiceMetrics.optimalKeys += optimal;
    practiceMetrics.deviation += deviation;
    practiceMetrics.accuracy = practiceMetrics.keystrokes > 0
        ? Math.min(100, Math.round((practiceMetrics.optimalKeys / practiceMetrics.keystrokes) * 100))
        : 100;
    const clean = deviation === 0;
    practiceMetrics.streak = clean ? practiceMetrics.streak + 1 : 0;
    practiceMetrics.bestStreak = Math.max(practiceMetrics.bestStreak, practiceMetrics.streak);
    task.categories.forEach(category => {
        practiceMetrics.categories[category].attempts += 1;
        if (clean) practiceMetrics.categories[category].completed += 1;
    });
    practiceMetrics.taskStartKeys = practiceMetrics.keystrokes;
    saveStoredCategories();
}

const GOLF_RESULTS_KEY = 'vimcatch-golf-results-v1';
let golfResults = {};

export function getGolfResult(taskId) {
    try {
        const stored = JSON.parse(localStorage.getItem(GOLF_RESULTS_KEY) || '{}');
        const result = stored[taskId];
        if (Number.isInteger(result?.best) && result.best > 0 && Number.isInteger(result.last) && result.last > 0) {
            return { ...result };
        }
        return null;
    } catch { return golfResults[taskId] ? { ...golfResults[taskId] } : null; }
}

function saveGolfResult(taskId, keys) {
    if (!Number.isInteger(keys) || keys <= 0) return;
    const previous = getGolfResult(taskId);
    let stored = {};
    try {
        stored = JSON.parse(localStorage.getItem(GOLF_RESULTS_KEY) || '{}');
        golfResults = stored && typeof stored === 'object' ? stored : {};
    } catch { /* Optional storage. */ }
    const result = { last: keys, best: Math.min(previous?.best ?? keys, keys), attempts: (previous?.attempts || 0) + 1 };
    golfResults[taskId] = result;
    try { localStorage.setItem(GOLF_RESULTS_KEY, JSON.stringify({ ...stored, ...golfResults })); } catch { /* In-memory fallback. */ }
}

export function getPracticeMetrics() {
    return JSON.parse(JSON.stringify(practiceMetrics));
}

export function loadChallengeTask(task, gameState) {
    if (!task) return;
    if (gameState.resetLevelState) gameState.resetLevelState();
    gameState.setContent([...task.initialContent]);
    gameState.setCursor({ ...(task.initialCursor || { row: 0, col: 0 }) });
    gameState.setMode('NORMAL');
}

export const startChallenge = (gameState, config = practiceConfig) => {
    if (gameState.currentChallenge) return gameState.currentChallenge;
    resetPracticeMetrics();
    const challenge = createPracticeChallenge(config);
    gameState.currentChallenge = challenge;
    gameState.currentTaskIndex = 0;
    gameState.challengeScoreValue = 0;
    gameState.challengeProgressValue = 0;
    gameState.challengeStartTime = 0;
    loadChallengeTask(challenge.tasks[0], gameState);
    gameState.setCurrentChallenge(challenge);
    gameState.setCurrentTaskIndex(0);
    gameState.setChallengeScoreValue(0);
    gameState.setChallengeProgressValue(0);
    gameState.setChallengeStartTime(0);
    return challenge;
};

export const calculateTaskPoints = (challenge, challengeStartTime) => {
    if (challenge.mode === 'golf') return 0;
    if (challenge.mode && challenge.mode !== 'time') return 10;
    const timeRemaining = getChallengeTimeRemaining({ currentChallenge: challenge, challengeStartTime });
    return 10 + Math.max(0, Math.floor(timeRemaining / 10));
};

export const getChallengeTimeRemaining = (gameState) => {
    if (!gameState.currentChallenge || !gameState.challengeStartTime || !Number.isFinite(gameState.currentChallenge.timeLimit)) return 0;
    const elapsed = Math.floor((Date.now() - gameState.challengeStartTime) / 1000);
    return Math.max(0, gameState.currentChallenge.timeLimit - elapsed);
};
