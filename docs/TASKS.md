# Implementation Tasks

Codex should work from top to bottom unless a task explicitly depends on later design input. Keep this file updated by checking completed items and adding concise notes where useful.

## Milestone 0 — Project foundation

- [x] Initialize a Vite TypeScript project in this directory without deleting documentation.
- [x] Enable strict TypeScript settings.
- [x] Add scripts for development, build, tests, linting, and end-to-end tests.
- [x] Configure Vitest.
- [x] Configure Playwright.
- [x] Add a minimal HTML shell and responsive page styles.
- [x] Create a canvas and render a static test scene.
- [x] Confirm `npm run build` succeeds.

Milestone 0 verified on 2026-07-16 with lint, formatting, unit-test,
production-build, and Chromium smoke-test checks.

## Milestone 1 — First playable vertical slice

- [x] Implement typed game configuration.
- [x] Implement viewport scaling with a fixed logical resolution.
- [x] Implement the animation loop with delta clamping.
- [x] Implement Ready, Playing, and GameOver states.
- [x] Implement normalized keyboard, pointer, and touch input.
- [x] Implement player gravity, jump velocity, and fall-speed clamp.
- [x] Render the player using Canvas primitives.
- [x] Implement obstacle-pair data and horizontal motion.
- [x] Implement safe random gap placement.
- [x] Recycle or respawn off-screen obstacles.
- [x] Render obstacles aligned with their collision rectangles.
- [x] Implement circle-versus-rectangle collision.
- [x] Implement top and bottom boundary collision.
- [x] Implement one-point-per-obstacle scoring.
- [x] Render current score.
- [x] Implement game-over overlay.
- [x] Implement clean restart with a short input guard.
- [x] Add unit tests for physics, collision, obstacle bounds, scoring, and restart.
- [x] Add a Playwright smoke test for load and start input.

Milestone 1 verified on 2026-07-20 with 44 unit tests, four Chromium
smoke tests, lint, formatting, production build, and manual browser checks.

## Deployment — GitHub Pages

- [x] Add an environment-driven Vite base path for project-site builds.
- [x] Preserve root-path development, builds, and production previews.
- [x] Add a lockfile-safe GitHub Actions build, test, and Pages deployment workflow.
- [x] Add production-preview browser coverage for the Pages base path.
- [x] Document local preview, automatic deployment, and manual deployment.
- [ ] Enable GitHub Pages with GitHub Actions as the source in repository settings.
- [ ] Confirm the first successful deployment at `https://tdr680.github.io/jumpyber/`.

Deployment configuration verified on 2026-07-26 with formatting, lint, 44 unit
tests, root and project-path production builds, and four Chromium smoke tests
against both the development server and each production preview.

## Milestone 2 — Feel and usability

- [ ] Tune gravity, jump velocity, gap size, speed, and spacing through repeated playtests.
- [ ] Add velocity-driven player rotation or procedural pose animation.
- [ ] Add clear score feedback.
- [ ] Add clear collision feedback.
- [ ] Persist best score in local storage.
- [ ] Add mute preference and basic sound effects.
- [ ] Pause safely when the tab is hidden.
- [ ] Verify mobile touch behavior and prevent unwanted scrolling.
- [ ] Verify high-DPI rendering.
- [ ] Add end-to-end coverage for game over and restart.

## Milestone 3 — Original presentation

- [ ] Choose an original theme for player, obstacles, and environment.
- [ ] Replace temporary shapes only where final art improves the game.
- [ ] Add restrained parallax background layers.
- [ ] Improve start and game-over UI.
- [ ] Add an application icon and metadata.
- [ ] Confirm no visual asset resembles copyrighted Flappy Bird artwork.

## Milestone 4 — Release readiness

- [x] Test production build through a static HTTP server.
- [ ] Verify desktop Chrome, Safari, and Firefox.
- [ ] Verify mobile Safari and mobile Chrome where available.
- [ ] Audit keyboard accessibility and focus behavior.
- [x] Confirm no runtime network dependency.
- [ ] Confirm there are no console errors during a complete run/restart cycle.
- [x] Add deployment instructions to `README.md`.
- [ ] Record final architecture decisions in `DECISIONS.md`.

## Later ideas — not part of the MVP

- [ ] Daily seeded challenge
- [ ] Alternative obstacle themes
- [ ] Unlockable cosmetic characters
- [ ] Replay ghost
- [ ] Reduced-motion mode
- [ ] Installable PWA
- [ ] Local statistics screen

Do not begin later ideas until release readiness is complete.
