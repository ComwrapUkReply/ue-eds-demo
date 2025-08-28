## Navigation Block

Dynamic navigation that fetches `query-index.json` and builds a two-level tree (root links and sub-links) with optional descriptions stored in Universal Editor page metadata.

### Authoring

Add a table with the block label and optional config:

`Navigation`

Optional rows:
- `Root Path` — e.g. `/` or `/products`
- `Max Depth` — 1-4 (default 2)

### Behavior
- Fetches `query-index.json` and detects pages under the configured root path.
- Creates root entries and their direct children as sub-links.
- Shows page descriptions when available.
- Skips pages marked `noindex` in `robots`.

### Accessibility
- Uses semantic `<nav>` with an unordered list.
- Toggle buttons for submenus set `aria-expanded`.

### Styling
- Wrapper class: `navigation-wrapper` (no styles on container).
- Block class: `navigation`.
- Elements: `navigation-root`, `navigation-item`, `navigation-link`, `navigation-toggle`, `navigation-children`, `navigation-child-item`, `navigation-child-link`, `navigation-description`.


