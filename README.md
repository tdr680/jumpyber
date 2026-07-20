# Jumpyber

A compact browser game inspired by Flappy Bird's one-button obstacle-dodging loop. It is intended to be built with TypeScript, Vite, and the HTML5 Canvas API.

## Current status

Milestone 0 is complete. The project currently renders a responsive static Canvas
preview; interactive gameplay is planned for Milestone 1.

## Getting started

Use a current Node.js 22 release, then install the project and Playwright's
Chromium runtime:

```bash
npm install
npx playwright install chromium
```

Start the development server:

```bash
npm run dev
```

## Available commands

```bash
npm run dev          # Start the Vite development server
npm run build        # Type-check and create the production build
npm run test         # Run Vitest unit tests
npm run test:watch   # Run Vitest in watch mode
npm run test:e2e     # Run Playwright browser tests
npm run lint         # Run ESLint
npm run format       # Format the repository with Prettier
npm run format:check # Verify formatting
```

## Start a Codex session

Open this directory as the project root, then give Codex a task such as:

> Read `AGENTS.md` and every file in `docs/`. Create an implementation plan for the first playable milestone. Do not write code until the plan is complete.

After reviewing the plan:

> Implement the first unchecked task in `docs/TASKS.md`. Run the relevant tests and update the task file when finished.

## Documentation

- `AGENTS.md` — operating instructions for coding agents
- `docs/PRODUCT.md` — product intent and scope
- `docs/GAMEPLAY.md` — mechanics and tuning model
- `docs/ARCHITECTURE.md` — proposed technical structure
- `docs/ART.md` — visual and animation direction
- `docs/TESTING.md` — quality strategy
- `docs/TASKS.md` — ordered implementation backlog
- `docs/DECISIONS.md` — architecture decision log
