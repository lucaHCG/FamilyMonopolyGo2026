# Kryspinów Family Go!

A responsive family board-game project inspired by the pace and delight of mobile roll-and-build games. The published game is public to play, but only the GitHub repository owner can change the master content.

## Current milestone

- Animated opening screen
- Character selection for 2–4 players
- Mobile and laptop layouts
- Central configuration for characters, venues, prices and challenges

Board movement, dice, venue upgrades and playable challenges will be added only after the visual foundation is approved.

## Owner customization

The master content currently lives in `game-config.js`:

- `characters`: names, roles, colours and temporary emoji avatars
- `venues`: venue names, purchase prices and upgrade prices
- `challenges`: titles, instructions and rewards
- `startingCoins`: starting balance

A protected parent editor will be introduced in a later milestone. Players do not have access to master editing.

## Run locally

Open `index.html`, or run a simple local server from the repository directory:

```bash
python3 -m http.server 8000
```
