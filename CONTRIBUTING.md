# Contributing to VimCatch

## Local setup

Use Node.js 22.13 or newer:

```bash
npm ci
npm start
```

Open `http://localhost:5180/`. Opening `index.html` directly from disk is not supported.
Run `npm run check` before submitting changes: it builds content and CSS, runs lint,
Contract, Golden and Vitest suites, and builds the application.

## Adding a lesson

1. Copy [example.lesson.json](content/schema/example.lesson.json) into `content/lessons/`.
2. Set a unique `lesson-*` ID matching the filename and a unique curriculum order.
3. Fill in author metadata, instructions, the initial buffer, one objective and a working `solution`.
4. Play the lesson in the browser and complete it.
5. Run `npm run check` and include the regenerated `content/index.json` and `js/lessons/generated-content.js`.

See the [lesson schema](content/schema/lesson.schema.md) for fields and supported
behavior requirements. Keep each lesson focused on one concept, with short
instructions and buffer lines under about 60 characters.

## Code changes

- Keep patches focused and match the existing ES module style.
- Define lesson content in JSON; do not add lesson-name checks to the engine.
- Add regression coverage for engine fixes and verified lessons for new commands.
- Use the structured logger for application logging.
- Preserve saved progress: repair invalid saves where possible; otherwise retain
  the original, back it up and notify the player. Clearing progress requires an
  explicit user action and a backup.
- For interface or engine changes, verify the affected flow, Practice Arena and
  progress export/import in the browser; check the console for errors.
- Describe the resulting behavior and verification in the pull request. Discuss
  architecture, dependencies, content schema or save-format changes in an issue first.
