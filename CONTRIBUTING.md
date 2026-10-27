# Contributing

treui is an archived prototype kept for reference. It is not actively developed,
so the bar for changes is "this fixes or clarifies something concrete", not "this
is a feature I want".

## Scope

- Welcome: bug fixes, a correction to the README or docs, cleanup that removes
  code nobody calls.
- Discuss in an issue first: new features, the Vue CLI → Vite migration, any
  change that alters how the graph stores or sends a conversation.

## Running the checks

There is no test suite. `npm run lint` (ESLint via `vue-cli-service`) is the only
automated check, and it must pass before a PR:

```bash
npm ci
npm run lint
npm run serve   # manual check: the dev server loads and the canvas accepts input
```

`npm run build` should also succeed if you touched anything under `src/` or
`vue.config.js`.

## Pull requests

- One concern per PR, small enough to review in a sitting.
- Describe the bug and the steps that reproduce it; for a fix, say what now
  behaves differently.
- Do not commit `dist/`, `node_modules/`, `.env*`, or editor files — they are
  already in `.gitignore`.
- Do not renumber or reformat untouched code; the repository history is meant to
  stay readable.
- Note any behaviour you could not verify locally.

## Issues

State the operating system, the Node version, and the exact command you ran.
A screenshot of the canvas helps for anything visual. Issues that ask for
maintenance work will probably stay open — say what you need and why.

## License

Contributions are accepted under AGPL-3.0-only, the license of the project. See
[`LICENSE`](LICENSE).
