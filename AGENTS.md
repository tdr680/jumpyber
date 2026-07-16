# AGENTS.md — Jumpyber

## Mission

Build **Jumpyber**, a small browser game inspired by the one-button rhythm of Flappy Bird, using **TypeScript, Vite, and the HTML5 Canvas API**.

The game should feel immediate, readable, and satisfying rather than feature-heavy. Prioritize responsive controls, predictable physics, clear feedback, and a clean codebase that can be expanded later.

## Working rules for Codex

1. Read this file and all files in `docs/` before making a plan or changing code.
2. Keep the project runnable after every meaningful change.
3. Prefer small, testable modules over a large `main.ts` file.
4. Do not introduce a game engine unless a task explicitly requires it.
5. Avoid unnecessary dependencies. Use browser APIs and lightweight utilities first.
6. Keep game simulation separate from rendering and browser input.
7. Use deterministic or injectable randomness where practical.
8. Add or update tests whenever gameplay logic changes.
9. Update `docs/TASKS.md` when completing or discovering work.
10. Record lasting technical decisions in `docs/DECISIONS.md`.
11. Do not rewrite unrelated code while completing a focused task.
12. Do not replace working assets or visual direction without documenting why.

## Required stack

- TypeScript with strict mode
- Vite
- HTML5 Canvas 2D
- Vitest for unit tests
- Playwright for browser-level smoke tests
- ESLint and Prettier, if not already configured

## Initial commands

The finished project should support:

```bash
npm install
npm run dev
npm run build
npm run test
npm run test:e2e
npm run lint
```

## Product constraints

- Runs in a modern desktop or mobile browser.
- Keyboard, mouse, and touch controls must work.
- The main action is a single jump/flap input.
- The game must restart quickly without reloading the page.
- The canvas should preserve the designed aspect ratio and scale cleanly.
- The first playable version must not depend on downloaded image assets.
- Use simple Canvas shapes as placeholders until final art is approved.
- Keep text readable on small screens.
- Avoid dark patterns, telemetry, accounts, advertisements, and network requirements.

## Core loop

1. Start screen waits for player input.
2. Player character moves forward automatically through a scrolling world.
3. Each input applies an upward impulse.
4. Gravity pulls the character downward.
5. Obstacles move from right to left.
6. Passing an obstacle increases score.
7. Collision with an obstacle or world boundary ends the run.
8. A game-over screen shows score and allows immediate restart.

## Recommended source layout

```text
src/
  main.ts
  app/
    GameApp.ts
    GameLoop.ts
    GameState.ts
  config/
    gameConfig.ts
  core/
    math.ts
    random.ts
    types.ts
  game/
    Player.ts
    Obstacle.ts
    ObstacleField.ts
    Collision.ts
    Score.ts
  input/
    InputController.ts
  rendering/
    CanvasRenderer.ts
    Viewport.ts
  audio/
    AudioController.ts
  ui/
    Overlay.ts
  styles/
    main.css
  tests/
public/
tests/
  e2e/
```

The exact layout may evolve, but separation of responsibilities should remain clear.

## Gameplay implementation principles

- Use elapsed time in seconds, not frame counts.
- Clamp unusually large frame deltas.
- Prefer a fixed simulation step with interpolation or a carefully bounded variable step.
- Store gameplay tuning values in `src/config/gameConfig.ts`.
- Use simple circle/rectangle collision for the first version.
- Keep score progression independent from render rate.
- Prevent repeated scoring for the same obstacle.
- Make restart reset all transient state, timers, input flags, and obstacle data.

## Definition of done for each task

A task is complete only when:

- The requested behavior works.
- TypeScript compiles without errors.
- Relevant tests pass.
- The production build succeeds.
- No obvious regression is introduced.
- Documentation is updated where the change affects architecture, controls, or gameplay.

## First milestone

Create a playable vertical slice with:

- Responsive canvas
- Start, playing, and game-over states
- One-button jump input
- Gravity and vertical movement
- Repeating obstacle pairs with gaps
- Collision detection
- Score counter
- Restart
- Unit tests for core physics/collision/scoring
- Playwright smoke test proving that the game loads and can enter the playing state

Do not add menus, progression systems, cosmetics, online services, or complex art before this milestone works reliably.
