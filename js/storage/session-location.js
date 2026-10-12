import * as state from '../core/game-state.js';
import { levels } from '../lessons/levels.js';
import { getPracticeConfig } from '../practice/challenges.js';

const STORAGE_KEY = 'vimcatch-session-location-v1';
const durations = [30, 60, 120, 300, 600, 900];
const MAX_TIME_TASKS = Math.max(...durations);

export function readSessionLocation() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (!saved || saved.version !== 1 || !['train', 'practice'].includes(saved.tab)) return null;
        if (!['time', 'golf'].includes(saved.practiceMode)) return null;
        const location = {
            version: 1, tab: saved.tab, practiceMode: saved.practiceMode,
            lessonId: typeof saved.lessonId === 'string' ? saved.lessonId : null,
            duration: durations.includes(saved.duration) ? saved.duration : 60,
            golfTaskId: typeof saved.golfTaskId === 'string' ? saved.golfTaskId : null
        };
        const time = saved.time;
        const timeProgress = time?.progress === undefined ? time?.index : time.progress;
        const timeFinished = time?.finished === true;
        if (time && Array.isArray(time.taskIds) && time.taskIds.length <= MAX_TIME_TASKS
            && time.taskIds.every(id => typeof id === 'string' && id.length <= 100)
            && Number.isInteger(time.index) && time.index >= 0 && time.index < time.taskIds.length
            && Number.isInteger(timeProgress) && timeProgress >= 0 && timeProgress <= time.taskIds.length
            && (timeProgress === time.index
                || (timeFinished && time.index === time.taskIds.length - 1 && timeProgress === time.taskIds.length))
            && durations.includes(time.duration)
            && (time.deadline === undefined || time.deadline === null
                || (Number.isFinite(time.deadline) && time.deadline > 0
                    && time.deadline <= Date.now() + time.duration * 1000))) {
            location.time = {
                taskIds: time.taskIds, index: time.index, duration: time.duration,
                score: Number.isFinite(time.score) && time.score >= 0 ? time.score : 0,
                progress: timeProgress,
                deadline: Number.isFinite(time.deadline) ? time.deadline : null,
                finished: timeFinished
            };
        }
        return location;
    } catch {
        return null;
    }
}

export function saveSessionLocation() {
    try {
        const previous = readSessionLocation();
        const config = getPracticeConfig();
        const challenge = state.getChallengeMode() ? state.getCurrentChallenge() : null;
        const location = {
            version: 1,
            tab: challenge ? 'practice' : 'train',
            practiceMode: ['time', 'golf'].includes(config.mode) ? config.mode : 'time',
            lessonId: levels[state.getCurrentLevel()]?.id || null,
            duration: durations.includes(config.duration) ? config.duration : 60,
            golfTaskId: previous?.golfTaskId || null,
            time: previous?.time
        };
        if (challenge?.mode === 'golf') location.golfTaskId = challenge.tasks[state.getCurrentTaskIndex()]?.id;
        if (challenge?.mode === 'time') {
            location.time = {
                taskIds: challenge.tasks.map(task => task.id), index: state.getCurrentTaskIndex(),
                duration: challenge.timeLimit, score: state.getChallengeScoreValue(),
                progress: state.getChallengeProgressValue(),
                deadline: state.getChallengeStartTime() ? state.getChallengeStartTime() + challenge.timeLimit * 1000 : null,
                finished: challenge.finished === true
            };
        }
        const serialized = JSON.stringify(location);
        // Cursor movement and typing must not cause redundant storage writes.
        if (localStorage.getItem(STORAGE_KEY) !== serialized) localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
        // Training remains usable when storage is unavailable or full.
    }
}
