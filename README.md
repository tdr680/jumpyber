# Jumpyber

A compact browser game inspired by Flappy Bird's one-button obstacle-dodging loop. It is intended to be built with TypeScript, Vite, and the HTML5 Canvas API.

## Current status

Milestone 1 is complete. Jumpyber is a playable vertical slice with responsive
Canvas rendering, one-button controls, obstacles, collision, scoring, game over,
and immediate guarded restart.

## Getting started

Use a current Node.js LTS release, then install the locked dependencies and
Playwright's Chromium runtime:

```bash
npm ci
npx playwright install chromium
```

Start the development server:

```bash
npm run dev
```

Vite prints the local URL when it starts. Local development always uses `/` as
the application base path.

## Controls

- Press Space, Arrow Up, or W to jump.
- Click or tap the game canvas to jump.
- The first action starts the run and jumps.
- After game over, wait briefly and press, click, or tap to restart and jump.

## Available commands

```bash
npm run dev          # Start the Vite development server
npm run build        # Type-check and create the production build
npm run preview      # Preview the existing production build
npm run test         # Run Vitest unit tests
npm run test:watch   # Run Vitest in watch mode
npm run test:e2e     # Run Playwright browser tests
npm run test:e2e:preview # Test an existing build through production preview
npm run lint         # Run ESLint
npm run format       # Format the repository with Prettier
npm run format:check # Verify formatting
```

Build and preview the root-hosted production output locally:

```bash
npm run build
npm run preview
```

To reproduce the GitHub Pages project-path build and its browser smoke test:

```bash
VITE_BASE_PATH=/jumpyber/ npm run build
VITE_BASE_PATH=/jumpyber/ npm run test:e2e:preview
```

## Deployment

The
[`deploy-pages.yml`](.github/workflows/deploy-pages.yml)
workflow builds, checks, and deploys the generated `dist/` directory whenever a
commit is pushed to the repository's default `master` branch. It can also be run
manually from **Actions → Build, test, and deploy GitHub Pages → Run workflow**.
The workflow uses the repository name to set Vite's deployment base path; local
builds continue to default to `/`.

This repository is a GitHub Pages project site. Its expected public URL is:

```text
https://tdr680.github.io/jumpyber/
```

Before the first deployment, open **Settings → Pages** in the GitHub repository
and set **Build and deployment → Source** to **GitHub Actions**. No generated
files, personal access token, or repository secret are needed. The public URL
becomes available after the first successful workflow run.

If deployment fails, open the repository's **Actions** tab, select the failed
workflow run, and expand the failing build or deploy step. Tests and the
production build run before the Pages artifact is uploaded, so a failed check
cannot publish a new version.

## Start a Codex session

Open this directory as the project root, then give Codex a task such as:

> Read `AGENTS.md` and every file in `docs/`. Create an implementation plan for the first playable milestone. Do not write code until the plan is complete.

After reviewing the plan:

> Implement the first unchecked task in `docs/TASKS.md`. Run the relevant tests and update the task file when finished.

## Documentation

- `AGENTS.md` — operating instructions for coding agents
- `docs/PRODUCT.md` — product intent and scope
- `docs/GAMEPLAY.md` — mechanics and tuning model
- `docs/ARCHITECTURE.md` — current technical structure
- `docs/ART.md` — visual and animation direction
- `docs/TESTING.md` — quality strategy
- `docs/TASKS.md` — ordered implementation backlog
- `docs/DECISIONS.md` — architecture decision log
