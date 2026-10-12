# Lesson schema

Every lesson is a JSON file under `content/lessons/`. Copy
`content/schema/example.lesson.json`, change its ID and curriculum order, then run
`npm run check`.

## Required top-level fields

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Unique slug matching `lesson-[a-z0-9-]+` and the filename |
| `version` | `1` | Content schema version |
| `name` | string | Player-facing lesson name |
| `instructions` | string | Player-facing task instructions |
| `metadata` | object | Attribution, difficulty and curriculum information |
| `initialContent` | `string[]` | Non-empty starting editor buffer |
| `solution` | `string[]` | Key sequence replayed by the Golden Suite |

Exactly one objective field is required:

- `target: {row, col}` — final cursor position.
- `targetText: {line, text}` — expected text on one line.
- `targetContent: string[]` — expected full buffer.
- `exCommands: string[]` — accepted Ex commands.

## Optional top-level fields

| Field | Type | Purpose |
|---|---|---|
| `initialCursor` | `{row, col}` | Starting cursor; defaults to `{0,0}` |
| `focusCommand` | string | Main command displayed by lesson and practice UI |
| `files` | object | Virtual files available to `:e` lessons |
| `requires` | array | Additional behavior requirements evaluated with the objective |

Supported `requires` entries:

```json
{"type":"search","direction":"forward","query":"target","minNavigations":1}
```

```json
{"type":"undoThenRedo"}
```

## Metadata

Required metadata fields:

- `revision`: numeric content revision.
- `author`: contributor name or alias.
- `githubUsername`: contributor handle.
- `order`: unique numeric curriculum position.
- `estimatedTime`: expected completion time in seconds.
- `prerequisites`: array of existing lesson IDs.
- `learningObjectives`: array of strings.
- `tags`: array of strings.

Optional metadata fields: `created` and `difficulty`. Difficulty must be
`beginner`, `intermediate`, or `advanced`.

## Validation

`npm run check` regenerates the content bundle, validates every lesson and
cross-lesson reference, replays every solution, runs lint, and executes the test
suite. Invalid content is rejected before generated artifacts are written.
