const config = window.GAME_CONFIG;
const homeScreen = document.querySelector("#home-screen");
const characterScreen = document.querySelector("#character-screen");
const gameScreen = document.querySelector("#game-screen");
const characterGrid = document.querySelector("#character-grid");
const selectedCount = document.querySelector("#selected-count");
const selectedNames = document.querySelector("#selected-names");
const confirmPlayers = document.querySelector("#confirm-players");
const previewDialog = document.querySelector("#preview-dialog");
const previewMessage = document.querySelector("#preview-message");
const gameBoard = document.querySelector("#game-board");
const rollButton = document.querySelector("#roll-dice");
const dice = document.querySelector("#dice");
const boardHint = document.querySelector("#board-hint");
const movementLog = document.querySelector("#movement-log");
const selected = new Set();
const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

let activePlayers = [];
let positions = {};
let currentTurnIndex = 0;
let turnNumber = 1;
let isMoving = false;

function showScreen(screenToShow, screenToHide) {
  screenToHide.classList.remove("screen--active");
  window.setTimeout(() => {
    screenToHide.hidden = true;
    screenToShow.hidden = false;
    window.requestAnimationFrame(() => screenToShow.classList.add("screen--active"));
  }, 180);
}

function avatarMarkup(character, className = "") {
  if (character.avatarImage) {
    return `<img class="${className}" src="${character.avatarImage}" alt="${character.name}">`;
  }
  return `<span class="${className}" aria-hidden="true">${character.emoji}</span>`;
}

function renderCharacters() {
  characterGrid.innerHTML = config.characters.map((character) => `
    <button class="character-card" type="button" data-character-id="${character.id}" aria-pressed="false">
      <span class="character-glow" style="--character-colour: ${character.colour}"></span>
      <span class="character-avatar" style="--character-colour: ${character.colour}">${avatarMarkup(character)}</span>
      <span class="character-info">
        <strong>${character.name}</strong>
        <small>${character.role}</small>
      </span>
      <span class="selection-tick" aria-hidden="true">✓</span>
    </button>
  `).join("");
}

function updateSelection() {
  const chosenCharacters = config.characters.filter(({ id }) => selected.has(id));
  selectedCount.textContent = String(chosenCharacters.length);
  selectedNames.textContent = chosenCharacters.length
    ? chosenCharacters.map(({ name }) => name).join(", ")
    : "Choose at least two";
  confirmPlayers.disabled = chosenCharacters.length < 2;
}

function renderBoard() {
  gameBoard.querySelectorAll(".board-space").forEach((space) => space.remove());
  config.boardSpaces.forEach((space, index) => {
    const tile = document.createElement("div");
    tile.className = `board-space board-space--${space.type}`;
    tile.dataset.spaceIndex = String(index);
    tile.style.gridRow = String(space.row);
    tile.style.gridColumn = String(space.column);
    tile.innerHTML = `
      <span class="space-emoji" aria-hidden="true">${space.emoji}</span>
      <strong>${space.label}</strong>
      <span class="token-stack" data-token-space="${index}"></span>
    `;
    gameBoard.appendChild(tile);
  });
  renderTokens();
}

function renderTokens() {
  document.querySelectorAll(".token-stack").forEach((stack) => { stack.innerHTML = ""; });
  activePlayers.forEach((player) => {
    const stack = document.querySelector(`[data-token-space="${positions[player.id]}"]`);
    if (!stack) return;
    const token = document.createElement("span");
    token.className = "player-token";
    token.style.setProperty("--token-colour", player.colour);
    token.title = player.name;
    token.innerHTML = avatarMarkup(player, "player-token-avatar");
    stack.appendChild(token);
  });
}

function renderTurnState() {
  const currentPlayer = activePlayers[currentTurnIndex];
  if (!currentPlayer) return;

  document.querySelector("#current-player-name").textContent = currentPlayer.name;
  document.querySelector("#centre-player-name").textContent = `${currentPlayer.name}'s turn`;
  document.querySelector("#turn-number").textContent = String(turnNumber);
  document.querySelector("#current-player-avatar").innerHTML = avatarMarkup(currentPlayer);
  document.querySelector("#current-player-avatar").style.setProperty("--player-colour", currentPlayer.colour);

  document.querySelector("#player-order").innerHTML = activePlayers.map((player, index) => `
    <div class="order-player ${index === currentTurnIndex ? "order-player--active" : ""}">
      <span class="order-avatar" style="--player-colour: ${player.colour}">${avatarMarkup(player)}</span>
      <span><strong>${player.name}</strong><small>${index === currentTurnIndex ? "Rolling now" : "Waiting"}</small></span>
    </div>
  `).join("");
}

function initialiseBoardGame() {
  activePlayers = config.characters.filter(({ id }) => selected.has(id));
  positions = Object.fromEntries(activePlayers.map(({ id }) => [id, 0]));
  currentTurnIndex = 0;
  turnNumber = 1;
  isMoving = false;
  dice.textContent = diceFaces[0];
  boardHint.textContent = "Tap the dice to begin.";
  movementLog.innerHTML = "<li>The adventure is ready.</li>";
  renderBoard();
  renderTurnState();
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function moveCurrentPlayer(steps) {
  const currentPlayer = activePlayers[currentTurnIndex];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stepDelay = reducedMotion ? 70 : 280;

  for (let step = 0; step < steps; step += 1) {
    const oldSpace = document.querySelector(`[data-space-index="${positions[currentPlayer.id]}"]`);
    oldSpace?.classList.remove("board-space--landed");
    positions[currentPlayer.id] = (positions[currentPlayer.id] + 1) % config.boardSpaces.length;
    renderTokens();
    const newSpace = document.querySelector(`[data-space-index="${positions[currentPlayer.id]}"]`);
    newSpace?.classList.add("board-space--landed");
    await wait(stepDelay);
  }

  const landedSpace = config.boardSpaces[positions[currentPlayer.id]];
  boardHint.textContent = `${currentPlayer.name} landed on ${landedSpace.label}.`;
  const item = document.createElement("li");
  item.textContent = `${currentPlayer.name} rolled ${steps} → ${landedSpace.label}`;
  movementLog.prepend(item);
  while (movementLog.children.length > 4) movementLog.lastElementChild.remove();

  await wait(reducedMotion ? 80 : 450);
  currentTurnIndex = (currentTurnIndex + 1) % activePlayers.length;
  turnNumber += 1;
  renderTurnState();
  isMoving = false;
  rollButton.disabled = false;
}

async function rollDice() {
  if (isMoving || !activePlayers.length) return;
  isMoving = true;
  rollButton.disabled = true;
  boardHint.textContent = "Rolling…";
  dice.classList.add("dice--rolling");

  const roll = Math.floor(Math.random() * 6) + 1;
  for (let spin = 0; spin < 7; spin += 1) {
    dice.textContent = diceFaces[Math.floor(Math.random() * diceFaces.length)];
    await wait(70);
  }
  dice.textContent = diceFaces[roll - 1];
  dice.classList.remove("dice--rolling");
  boardHint.textContent = `${activePlayers[currentTurnIndex].name} rolled ${roll}!`;
  await moveCurrentPlayer(roll);
}

characterGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".character-card");
  if (!card) return;

  const id = card.dataset.characterId;
  if (selected.has(id)) {
    selected.delete(id);
    card.classList.remove("character-card--selected");
    card.setAttribute("aria-pressed", "false");
  } else if (selected.size < 4) {
    selected.add(id);
    card.classList.add("character-card--selected");
    card.setAttribute("aria-pressed", "true");
  }
  updateSelection();
});

document.querySelector("#open-character-select").addEventListener("click", () => {
  showScreen(characterScreen, homeScreen);
});

document.querySelector("#back-home").addEventListener("click", () => {
  showScreen(homeScreen, characterScreen);
});

document.querySelector("#back-to-players").addEventListener("click", () => {
  if (isMoving) return;
  showScreen(characterScreen, gameScreen);
});

confirmPlayers.addEventListener("click", () => {
  const names = config.characters.filter(({ id }) => selected.has(id)).map(({ name }) => name);
  previewMessage.textContent = `${names.join(", ")} are ready to explore Kryspinów together.`;
  previewDialog.showModal();
});

document.querySelector("#start-board").addEventListener("click", () => {
  previewDialog.close();
  initialiseBoardGame();
  showScreen(gameScreen, characterScreen);
});

document.querySelector("#close-preview").addEventListener("click", () => previewDialog.close());
rollButton.addEventListener("click", rollDice);

previewDialog.addEventListener("click", (event) => {
  if (event.target === previewDialog) previewDialog.close();
});

renderCharacters();
updateSelection();
