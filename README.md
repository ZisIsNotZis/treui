# treeui — a node graph you chat with

**What:** A single-page Vue 3 app that renders an infinite canvas of chat bubbles
as a `vis-network` graph. You double-click empty canvas to add a node, double-click
a node to edit its content and metadata, drag one node onto another to connect
them, and an empty node with at least one parent is filled by streaming an
OpenAI-compatible `/v1/chat/completions` response whose prompt is the chain of
ancestor nodes (`src/components/GraphCanvas.vue`).

**Why it exists:** To turn a linear chat transcript into a tree/branching structure
you can see, rearrange and edit directly — the conversation history *is* the graph
topology (parent edges → `messages` array), so branching, deleting a subtree
(Delete key) and re-parenting are drag/click operations instead of a forked-thread
UI. Metadata typed into the node (`max_token=256` by default) is parsed and spread
into the request body, so per-node sampling options live with the node. It is a
prototype sketch of "graph as the chat state", not a product.

**How to run:** Node ≥ 16 plus an OpenAI-compatible server listening on
`http://localhost:8080` (the code hardcodes that base URL; there is no config or
env var). Then:

```bash
npm ci        # or: npm install
npm run serve # dev server, hot reload; npm run build for a static bundle
```

**Status:** deprecated (2025 era) — kept as an archive. The UI code is Vue 3
(`setup()`, Composition API) and still modern, but the project is scaffolded with
**Vue CLI 5**, which is in maintenance mode upstream and superseded by
`create-vue`/Vite; the scaffold files (`vue.config.js`, `babel.config.js`,
`public/index.html`, `jsconfig.json`) are stock Vue CLI output and
`README.md` is the untouched CLI template text ("Project setup … Customize
configuration"). Beyond `GraphCanvas.vue` the repo is one-level-deep scaffolding.
It is also a stub in places: `src/api.js` exports `generateAIResponse()` but is
imported nowhere (`GraphCanvas.vue` calls `fetch` directly, and the axios version
sets `stream: true` without consuming the stream), and `cytoscape`,
`cytoscape-dagre` are declared in `package.json` but never imported. There is no
persistence, no backend, no tests, no env handling and no CI; the graph is lost on
reload. Last touched 2025-04.

**License:** No LICENSE file and no copyright headers (checked the whole
directory, excluding `node_modules`/lockfile). All rights reserved by default —
choose a license before publishing as a repo.
