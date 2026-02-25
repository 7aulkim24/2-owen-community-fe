# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview
This is a **frontend-only** Vanilla JS community web application (`community-fe`). It has no backend code — it requires a separate backend API server (`community-be`) running on port `8000` for full functionality (auth, posts, comments, etc.).

### Development Server
- After `npm install`, run the dev build: `npm run build` (copies HTML from `pages/` to root, bundles CSS)
- Serve the root directory with any static file server on port `5500` (e.g., `npx serve -l 5500 .`)
- Open `login.html` as the entry point
- The frontend has auth guards: pages like `make-post.html` redirect to `login.html` if no user session exists in `localStorage`

### Build Commands
- `npm run build` — dev build (HTML copy + CSS bundle, no JS minification)
- `npm run build:prod` — production build (HTML/CSS/JS bundled and minified into `dist/`)
- Build scripts are in `scripts/` (bash). They use `esbuild` for JS/CSS minification.

### Key Caveats
- **No ESLint/TypeScript/linter configured** — this project uses plain Vanilla JS with no lint tooling.
- **No automated test framework** — there are perf test scripts in `test/` but no unit/integration test runner (no Jest, Mocha, etc.).
- **Backend required for full E2E testing** — without the backend on port `8000`, API calls will fail. The frontend handles this gracefully (shows network error toasts).
- The dev build (`npm run build`) outputs HTML files to the project root directory (not `dist/`). The prod build outputs to `dist/`.
- Build scripts use `sed` and are compatible with both macOS and Linux.
