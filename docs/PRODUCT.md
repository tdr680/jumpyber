# Product Brief

## Working title

**Jumpyber**

## Concept

Jumpyber is a small, instantly understandable browser game. The player controls a character that continuously travels through a side-scrolling course. A single action gives the character an upward impulse. The challenge is to maintain altitude and pass through gaps between obstacles.

The design borrows the clarity and tension of Flappy Bird, but the implementation and presentation should be original.

## Experience goals

- The player understands the control within seconds.
- Movement feels responsive but not weightless.
- Failure feels fair and immediately understandable.
- Restarting is nearly instantaneous.
- A successful pass through an obstacle feels rewarding.
- The game remains readable on both mobile and desktop screens.

## Target platform

Modern evergreen browsers on:

- Desktop computers
- Tablets
- Mobile phones

The first release is a static client-side application requiring no backend.

## Target session

A single run may last from a few seconds to several minutes. The game should encourage quick repeated attempts without requiring accounts, tutorials, or setup.

## Audience

Players who enjoy short reflex games and score chasing. No prior gaming knowledge should be required.

## MVP scope

- Start screen
- One-button input
- Player physics
- Scrolling obstacle pairs
- Collision and death
- Score
- Best score saved locally
- Restart
- Basic sound toggle
- Responsive canvas
- Keyboard, pointer, and touch support

## Explicitly out of scope for the MVP

- User accounts
- Online leaderboard
- Multiplayer
- Shops or currencies
- Character progression
- Advertising
- Analytics
- Procedural story content
- Complex level editor
- Framework-heavy UI

## Success criteria

The MVP is successful when:

1. A new player can begin without instructions.
2. Input-to-action latency feels immediate.
3. The game maintains smooth animation on an ordinary mobile device.
4. Collisions appear consistent with what is drawn.
5. A player can restart with one input.
6. The game works without a network connection after loading.
