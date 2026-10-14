# Kryspinów Family Go!

A responsive family board-game project inspired by the pace and delight of mobile roll-and-build games. The published game is public to play, but only the GitHub repository owner can change the master content.

## Current milestone

- Animated opening screen
- Character selection for 2–4 players
- Mobile and laptop layouts
- Central configuration for characters, venues, prices and challenges
- Configurable board path with animated dice and player-token movement
- Automatic turn rotation between selected players
- Oli's custom toy-style avatar
- A first selection of venue names recovered from the original Kryspinów edition
- Starting balances, venue purchases and visible ownership
- Automatic rent transfers when a player lands on another player's venue

Venue upgrades and playable challenges are intentionally reserved for later milestones.

## Owner customization

The master content currently lives in `game-config.js`:

- `characters`: names, roles, colours, temporary emoji avatars and an optional `avatarImage`
- `boardSpaces`: board labels, icons, types and positions
- `venues`: venue names, purchase prices, rents and upgrade prices
- `challenges`: titles, instructions and rewards
- `startingCoins`: starting balance

A protected parent editor will be introduced in a later milestone. Players do not have access to master editing.

## Run locally

Open `index.html`, or run a simple local server from the repository directory:

```bash
python3 -m http.server 8000
```
