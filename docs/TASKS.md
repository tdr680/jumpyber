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
- [x] Enable GitHub Pages with GitHub Actions as the source in repository settings.
- [x] Confirm the first successful deployment at `https://tdr680.github.io/jumpyber/`.

Deployment configuration verified on 2026-07-26 with formatting, lint, 44 unit
tests, root and project-path production builds, and four Chromium smoke tests
against both the development server and each production preview.

## Milestone 1.5 — Procedural ascending and descending world

Detailed design and phased verification are in
[`TERRAIN_PLAN.md`](TERRAIN_PLAN.md).

- [x] Add typed terrain configuration with documented world-space slope units.
- [x] Implement deterministic seeded one-dimensional gradient noise without an external dependency.
- [x] Implement cached, position-indexed terrain slope integration.
- [x] Keep the opening horizontal and blend smoothly into procedural slope.
- [x] Add maximum-slope enforcement and smooth boundary bias.
- [x] Add authoritative world distance and reproducible run-seed lifecycle.
- [x] Place and recycle obstacles in world space using the shared terrain profile.
- [x] Use shared terrain samples for rendering, obstacle rectangles, and collision.
- [x] Render a continuous terrain path from fixed-distance world samples.
- [x] Add terrain-derived world-boundary collision.
- [x] Preserve scoring, game over, guarded restart, and all input methods.
- [x] Add seeded-noise, terrain-profile, geometry, restart, and long-run fairness tests.
- [x] Add browser smoke coverage for the production terrain build.
- [x] Update architecture, gameplay, testing, and task documentation after implementation.

Milestone 1.5 verified on 2026-07-26 with 62 unit tests, six Chromium
development-server tests, six root production-preview tests, six
GitHub-Pages-path production-preview tests, lint, formatting, TypeScript,
production builds, and visual inspection of the horizontal opening, descending
terrain, ascending terrain after a smooth reversal, aligned obstacles, scoring,
GameOver, and deterministic restart.

## Player sprite asset

- [x] Generate one consistent six-pose stick-figure source sheet with ImageGen.
- [x] Remove the chroma background and preserve transparent antialiased edges.
- [x] Normalize six 96×96 frames with one scale and shared centre anchor.
- [x] Export player sheet metadata and preserve the reusable generation prompt.
- [x] Add deterministic sheet-processing tooling and inspect a contact preview.
- [x] Load the sheet through Vite's deployment base with a Canvas fallback.
- [x] Map Ready, jump, rise, apex, fall, and GameOver to stable frames.
- [x] Keep player collision independent from sprite padding and pose.
- [x] Verify sprite animation in development and production browser tests.

Player sprite verified on 2026-07-26 with 66 unit tests, seven Chromium
development-server tests, seven root production-preview tests, seven
GitHub-Pages-path production-preview tests, TypeScript, lint, formatting,
production builds, normalized-sheet inspection, and runtime visual review.

## Obstacle body sprite asset

- [x] Keep one transparent 64×64 repeatable obstacle body tile.
- [x] Remove the cap, base, and damaged-cap assets.
- [x] Remove multi-piece assembly, mirroring, rotation, and variation code.
- [x] Tile the body directly through shared top and bottom collision rectangles.
- [x] Preserve varying obstacle heights and terrain-following gap positions.
- [x] Keep collision, spacing, gap size, scoring, recycling, and terrain generation unchanged.
- [x] Preserve a deterministic body-processing script and reusable prompt.
- [x] Load the body through Vite's deployment base with a Canvas fallback.
- [x] Verify development, root-preview, and GitHub-Pages-path browser behavior.

The body-only obstacle renderer was verified on 2026-07-29 with 68 unit tests,
seven Chromium development-server tests, seven root production-preview tests,
seven GitHub-Pages-path production-preview tests, TypeScript, lint, formatting,
production builds, deterministic asset reproduction, seam validation, and live
inspection across multiple terrain positions.

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
