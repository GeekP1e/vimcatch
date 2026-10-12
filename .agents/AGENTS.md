# Workspace Rules for Agents

## VimCatch Philosophy
- **Every new feature must be teachable as a lesson.** Any new Vim command, text object, or mechanic MUST have an accompanying lesson, Contract validation, Golden Test, and documentation.
- **Engine evolves slowly. Content evolves rapidly.** The engine acts as a stable API for content. Refactoring the engine should only happen when a new feature explicitly requires it, or bug fixes are necessary.

## Content architecture
- The game engine must NOT load lessons via inline arrays or text. It MUST use `js/lessons/content-loader.js` and `StaticContentProvider` to read the generated lesson bundle.
- Lessons are defined entirely in `content/lessons/*.json`.
