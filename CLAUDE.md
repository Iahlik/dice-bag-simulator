# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

No build step — open `index.html` directly in a browser. There are no dependencies, package managers, or dev servers.

## Architecture

Pure vanilla HTML/CSS/JS. All state is global; there is no module system. Scripts are loaded by `index.html` in a specific order that defines initialization dependencies:

```
config.js → setup.js → utils.js → ui.js → gameplay.js → orders.js → endgame.js
```

**`script.js` is NOT loaded by `index.html`** — it is an older monolithic version kept for reference. Do not edit it when making feature changes.

### Global state (declared in `setup.js`)

| Variable | Purpose |
|---|---|
| `players` | Array of player objects (`name`, `nation`, `diceTotal`, `diceLeft`, `orders`, `losses`, `cmdType`) |
| `diceBag` | Array of player indices (one entry per die) representing dice in the bag |
| `round` | Current round number (1-indexed) |
| `actionsByRound` | Array of string arrays — one inner array per round |
| `gameOver` | Boolean gate; prevents draws and orders when true |
| `gameStateHistory` | Snapshot stack for undo (`gameStateHistory.push/pop`) |
| `currentPlayerIndex` | Set when a die is drawn, cleared after order confirmed; prevents double-drawing |

### Function ownership — watch for redefinitions

`declareDown` and `convertAmbush` are defined in both `gameplay.js` and `orders.js`. Because `orders.js` loads last, its definitions win at runtime. The `orders.js` versions add `saveGameStateSnapshot()` calls before mutating state. If you add similar state-mutating functions, follow the same pattern.

### Game flow

1. **Setup** (`setup.js`): Roll mission parameters → configure players → `initializeGame()` populates `players` and `diceBag` and calls `renderGame()`
2. **Gameplay loop** (`gameplay.js`): `drawDice()` → order modal → `confirmModalOrder()` → repeat until bag empty → `nextRound()` → casualties modal → maintenance modal → `confirmMaintenance()` → advance round
3. **Round 7 gate** (`endgame.js`): After round 6, `gameEndModal` triggers a d6 roll; 4–6 plays round 7, 1–3 calls `endGame()`
4. **Undo** (`setup.js`): `saveGameStateSnapshot()` deep-clones all state before mutations; `undoLastAction()` pops and restores

### UI rendering

All DOM updates go through functions in `ui.js`: `renderCards()`, `updateHistory()`, `renderGame()`, `updateBagCount(diceBag)`. Modal visibility is toggled with `.classList.add/remove('hidden')`. The CSS class `hidden` sets `display: none`.

### Commander / Snap to Action mechanic

When a player confirms an order with the commander checkbox active, `confirmModalOrder()` in `gameplay.js` pulls additional dice from `diceBag` for the same player and assigns extra orders. The extra order count is capped to remaining dice belonging to that player (`diceBag.filter(d => d === currentPlayerIndex).length`).
