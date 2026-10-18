const config = window.GAME_CONFIG;
const familyAudio = window.FamilyAudio;
const homeScreen = document.querySelector("#home-screen");
const characterScreen = document.querySelector("#character-screen");
const gameScreen = document.querySelector("#game-screen");
const characterGrid = document.querySelector("#character-grid");
const selectedCount = document.querySelector("#selected-count");
const selectedNames = document.querySelector("#selected-names");
const confirmPlayers = document.querySelector("#confirm-players");
const previewDialog = document.querySelector("#preview-dialog");
const previewMessage = document.querySelector("#preview-message");
const purchaseDialog = document.querySelector("#purchase-dialog");
const buildDialog = document.querySelector("#build-dialog");
const chanceDialog = document.querySelector("#chance-dialog");
const rentDialog = document.querySelector("#rent-dialog");
const gameBoard = document.querySelector("#game-board");
const rollButton = document.querySelector("#roll-dice");
const dice = document.querySelector("#dice");
const boardHint = document.querySelector("#board-hint");
const movementLog = document.querySelector("#movement-log");
const selected = new Set();
const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const venueById = new Map(config.venues.map((venue) => [venue.id, venue]));
const spaceById = new Map(config.boardSpaces.map((space) => [space.id, space]));

let activePlayers = [];
let positions = {};
let balances = {};
let ownerships = {};
let currentTurnIndex = 0;
let turnNumber = 1;
let isMoving = false;
let purchaseResolver = null;
let buildResolver = null;
let buildReadyTimer = null;
let chanceResolver = null;
let rentResolver = null;

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

function formatMoney(amount) {
  return `${config.currencySymbol}${Number(amount).toLocaleString()}`;
}

function shuffledPlayers(players) {
  const shuffled = [...players];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function attractionCountFor(ownerId) {
  return config.venues.filter((venue) => (
    venue.group === "attraction" && ownerships[venue.id] === ownerId
  )).length;
}

function currentRentFor(venue, ownerId) {
  if (venue.group !== "attraction" || !Array.isArray(venue.rents)) {
    return venue.rent;
  }

  const ownedAttractions = Math.max(1, attractionCountFor(ownerId));
  return venue.rents[Math.min(ownedAttractions, venue.rents.length) - 1];
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
    const venue = venueById.get(space.id);
    const tile = document.createElement("div");
    tile.className = `board-space board-space--${space.type}`;
    tile.dataset.spaceIndex = String(index);
    tile.dataset.spaceId = space.id;
    tile.style.gridRow = String(space.row);
    tile.style.gridColumn = String(space.column);
    tile.innerHTML = `
      <span class="space-emoji" aria-hidden="true">${space.emoji}</span>
      ${venue?.landmarkImage ? `
        <span class="property-landmark" aria-hidden="true">
          <img src="${venue.landmarkImage}" alt="" width="256" height="256">
        </span>
      ` : ""}
      <strong>${space.label}</strong>
      <small class="space-meta"></small>
      <span class="token-stack" data-token-space="${index}"></span>
    `;
    gameBoard.appendChild(tile);
  });
  renderBoardEconomy();
  renderTokens();
}

function renderBoardEconomy() {
  config.boardSpaces.forEach((space) => {
    const tile = document.querySelector(`[data-space-id="${space.id}"]`);
    if (!tile) return;

    const meta = tile.querySelector(".space-meta");
    const venue = venueById.get(space.id);
    const ownerId = ownerships[space.id];
    const owner = activePlayers.find(({ id }) => id === ownerId);
    tile.classList.toggle("board-space--owned", Boolean(owner));
    tile.classList.toggle("board-space--landmark-built", Boolean(owner && venue?.landmarkImage));
    tile.style.removeProperty("--owner-colour");

    if (!venue) {
      meta.textContent = "";
      return;
    }

    if (owner) {
      tile.style.setProperty("--owner-colour", owner.colour);
      meta.textContent = `${owner.name} · rent ${formatMoney(currentRentFor(venue, owner.id))}`;
    } else {
      meta.textContent = `Buy ${formatMoney(venue.price)}`;
    }
  });
}

function renderTokens() {
  document.querySelectorAll(".board-space").forEach((space) => space.classList.remove("board-space--has-token"));
  document.querySelectorAll(".token-stack").forEach((stack) => { stack.innerHTML = ""; });
  activePlayers.forEach((player) => {
    const stack = document.querySelector(`[data-token-space="${positions[player.id]}"]`);
    if (!stack) return;
    stack.closest(".board-space")?.classList.add("board-space--has-token");
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

  document.querySelector("#player-order").innerHTML = activePlayers.map((player, index) => {
    const venueCount = Object.values(ownerships).filter((ownerId) => ownerId === player.id).length;
    const status = index === currentTurnIndex ? "Rolling now" : "Waiting";
    return `
      <div class="order-player ${index === currentTurnIndex ? "order-player--active" : ""}">
        <span class="order-avatar" style="--player-colour: ${player.colour}">${avatarMarkup(player)}</span>
        <span class="order-player-info">
          <strong>${player.name}</strong>
          <small>${status} · ${venueCount} venue${venueCount === 1 ? "" : "s"}</small>
        </span>
        <b class="player-balance">${formatMoney(balances[player.id])}</b>
      </div>
    `;
  }).join("");

  renderOwnershipSummary();
}

function renderOwnershipSummary() {
  const summary = document.querySelector("#ownership-summary");
  summary.innerHTML = activePlayers.map((player, index) => {
    const ownedVenues = config.venues.filter((venue) => ownerships[venue.id] === player.id);
    const venueMarkup = ownedVenues.length
      ? ownedVenues.map((venue) => {
        const space = spaceById.get(venue.id);
        return `<span class="owned-venue" title="${venue.name}"><i aria-hidden="true">${space?.emoji || "🏠"}</i><span>${venue.name}</span></span>`;
      }).join("")
      : `<span class="no-venues">No venues yet</span>`;

    return `
      <div class="ownership-row ${index === currentTurnIndex ? "ownership-row--active" : ""}" style="--owner-colour: ${player.colour}">
        <span class="ownership-avatar">${avatarMarkup(player)}</span>
        <span class="ownership-name">${player.name}</span>
        <b class="ownership-balance">${formatMoney(balances[player.id])}</b>
        <span class="owned-venue-list">${venueMarkup}</span>
      </div>
    `;
  }).join("");
}

function logAction(message) {
  const item = document.createElement("li");
  item.textContent = message;
  movementLog.prepend(item);
  while (movementLog.children.length > 6) movementLog.lastElementChild.remove();
}

function initialiseBoardGame() {
  activePlayers = shuffledPlayers(config.characters.filter(({ id }) => selected.has(id)));
  positions = Object.fromEntries(activePlayers.map(({ id }) => [id, 0]));
  balances = Object.fromEntries(activePlayers.map(({ id }) => [id, config.startingCoins]));
  ownerships = {};
  currentTurnIndex = 0;
  turnNumber = 1;
  isMoving = false;
  dice.textContent = diceFaces[0];
  boardHint.textContent = `${activePlayers[0].name} goes first! Tap the dice.`;
  movementLog.innerHTML = `
    <li>Playing order: ${activePlayers.map(({ name }) => name).join(" → ")}.</li>
    <li>Everyone starts with ${formatMoney(config.startingCoins)}.</li>
  `;
  renderBoard();
  renderTurnState();
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function finishPurchaseChoice(shouldBuy) {
  if (!purchaseResolver) return;
  const resolve = purchaseResolver;
  purchaseResolver = null;
  if (purchaseDialog.open) purchaseDialog.close();
  resolve(shouldBuy);
}

function requestPurchase(player, space, venue) {
  const isAttraction = venue.group === "attraction";
  document.querySelector("#purchase-icon").textContent = space.emoji;
  document.querySelector("#purchase-title").textContent = venue.name;
  document.querySelector("#purchase-message").textContent = `${player.name}, would you like to buy this ${isAttraction ? "attraction" : "venue"}? You currently have ${formatMoney(balances[player.id])}.`;
  document.querySelector("#purchase-price").textContent = formatMoney(venue.price);
  document.querySelector("#purchase-rent").textContent = isAttraction
    ? venue.rents.map(formatMoney).join(" / ")
    : formatMoney(venue.rent);
  document.querySelector("#buy-venue").textContent = isAttraction ? "Buy attraction" : "Buy venue";
  purchaseDialog.showModal();
  return new Promise((resolve) => { purchaseResolver = resolve; });
}

function finishBuildAnimation() {
  const finishButton = document.querySelector("#finish-build");
  if (!buildResolver || finishButton.disabled) return;
  window.clearTimeout(buildReadyTimer);
  const resolve = buildResolver;
  buildResolver = null;
  if (buildDialog.open) buildDialog.close();
  resolve();
}

function showBuildAnimation(player, venue) {
  const landmarkImage = document.querySelector("#build-landmark-image");
  const finishButton = document.querySelector("#finish-build");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelector("#build-title").textContent = `Building ${venue.name}!`;
  document.querySelector("#build-message").textContent = `${player.name} is creating a new landmark for the family board.`;
  landmarkImage.src = venue.landmarkImage;
  landmarkImage.alt = `New 3D landmark for ${venue.name}`;
  buildDialog.style.setProperty("--owner-colour", player.colour);
  finishButton.disabled = true;
  finishButton.textContent = "Building…";
  buildDialog.classList.remove("build-dialog--animate");
  void buildDialog.offsetWidth;
  buildDialog.classList.add("build-dialog--animate");
  buildDialog.showModal();
  familyAudio?.cue("build");

  buildReadyTimer = window.setTimeout(() => {
    finishButton.disabled = false;
    finishButton.textContent = "Place it on the board!";
    finishButton.focus();
  }, reducedMotion ? 120 : 2600);

  return new Promise((resolve) => { buildResolver = resolve; });
}

function finishChanceCard() {
  if (!chanceResolver) return;
  const resolve = chanceResolver;
  chanceResolver = null;
  if (chanceDialog.open) chanceDialog.close();
  resolve();
}

function showChanceCard(player) {
  const card = config.chanceCards[Math.floor(Math.random() * config.chanceCards.length)];
  let result = "";

  if (card.action === "advance-go") {
    positions[player.id] = 0;
    balances[player.id] += card.amount;
    result = `${player.name} moves to GO and receives ${formatMoney(card.amount)}.`;
  } else if (card.action === "collect") {
    balances[player.id] += card.amount;
    result = `${player.name} receives ${formatMoney(card.amount)}.`;
  } else if (card.action === "pay") {
    const paid = Math.min(card.amount, balances[player.id]);
    balances[player.id] -= paid;
    result = `${player.name} pays ${formatMoney(paid)}.`;
  } else if (card.action === "pay-per-venue") {
    const venueCount = Object.values(ownerships).filter((ownerId) => ownerId === player.id).length;
    const paid = Math.min(card.amount * venueCount, balances[player.id]);
    balances[player.id] -= paid;
    result = venueCount
      ? `${player.name} pays ${formatMoney(paid)} for ${venueCount} venue${venueCount === 1 ? "" : "s"}.`
      : `${player.name} owns no venues, so pays nothing.`;
  } else if (card.action === "go-jail") {
    positions[player.id] = config.boardSpaces.findIndex(({ id }) => id === "jail");
    result = `${player.name} moves directly to Jail.`;
  }

  renderTokens();
  document.querySelectorAll(".board-space--landed").forEach((tile) => tile.classList.remove("board-space--landed"));
  document.querySelector(`[data-space-index="${positions[player.id]}"]`)?.classList.add("board-space--landed");
  document.querySelector("#chance-card-text").textContent = card.text;
  document.querySelector("#chance-result").textContent = result;
  boardHint.textContent = result;
  logAction(`Chance: ${result}`);
  renderTurnState();
  familyAudio?.cue(card.action === "go-jail" ? "jail" : "chance");
  chanceDialog.showModal();
  return new Promise((resolve) => { chanceResolver = resolve; });
}

function finishRentAnimation() {
  if (!rentResolver) return;
  const resolve = rentResolver;
  rentResolver = null;
  if (rentDialog.open) rentDialog.close();
  resolve();
}

function showRentAnimation(player, owner, space, venue, amount) {
  const payerAnimation = document.querySelector("#rent-payer-animation");
  const ownerAnimation = document.querySelector("#rent-owner-animation");
  const replayToken = Date.now();

  payerAnimation.src = `assets/${player.id}-payer.gif?v=1#${replayToken}`;
  payerAnimation.alt = `${player.name} looks grumpy and opens a wallet`;
  ownerAnimation.src = `assets/${owner.id}-owner.gif?v=1#${replayToken}`;
  ownerAnimation.alt = `${owner.name} laughs and celebrates`;
  document.querySelector("#rent-payer-name").textContent = player.name;
  document.querySelector("#rent-owner-name").textContent = owner.name;
  document.querySelector("#rent-venue-emoji").textContent = space.emoji;
  document.querySelector("#rent-venue-name").textContent = venue.name;
  document.querySelector("#rent-result").textContent = `${player.name} pays ${formatMoney(amount)} to ${owner.name}.`;

  rentDialog.classList.remove("rent-dialog--animate");
  void rentDialog.offsetWidth;
  rentDialog.classList.add("rent-dialog--animate");
  rentDialog.showModal();
  return new Promise((resolve) => { rentResolver = resolve; });
}

async function handleLanding(player, space) {
  if (space.type === "chance") {
    await showChanceCard(player);
    return;
  }

  if (space.type === "game-card") {
    boardHint.textContent = `${player.name} found the Game Card.`;
    logAction(`${player.name} landed on the Game Card`);
    return;
  }

  if (space.type === "jail") {
    boardHint.textContent = `${player.name} is just visiting Jail.`;
    logAction(`${player.name} is just visiting Jail`);
    familyAudio?.cue("jail");
    return;
  }

  const venue = venueById.get(space.id);
  if (!venue) return;

  const ownerId = ownerships[venue.id];
  if (!ownerId) {
    if (balances[player.id] < venue.price) {
      boardHint.textContent = `${player.name} cannot afford ${venue.name}.`;
      logAction(`${player.name} needs ${formatMoney(venue.price)} to buy ${venue.name}`);
      return;
    }

    const shouldBuy = await requestPurchase(player, space, venue);
    if (shouldBuy) {
      balances[player.id] -= venue.price;
      ownerships[venue.id] = player.id;
      boardHint.textContent = `${player.name} bought ${venue.name}!`;
      logAction(`${player.name} bought ${venue.name} for ${formatMoney(venue.price)}`);
      renderTurnState();
      if (venue.landmarkImage) await showBuildAnimation(player, venue);
    } else {
      boardHint.textContent = `${player.name} left ${venue.name} available.`;
      logAction(`${player.name} did not buy ${venue.name}`);
    }
  } else if (ownerId === player.id) {
    boardHint.textContent = `${player.name} visited their own ${venue.group === "attraction" ? "attraction" : "venue"}.`;
    logAction(`${player.name} visited ${venue.name}`);
  } else {
    const owner = activePlayers.find(({ id }) => id === ownerId);
    const rent = currentRentFor(venue, owner.id);
    const paidRent = Math.min(rent, balances[player.id]);
    balances[player.id] -= paidRent;
    balances[owner.id] += paidRent;
    boardHint.textContent = `${player.name} paid ${formatMoney(paidRent)} rent to ${owner.name}.`;
    logAction(`${player.name} paid ${owner.name} ${formatMoney(paidRent)} rent at ${venue.name}`);
    renderBoardEconomy();
    renderTurnState();
    await showRentAnimation(player, owner, space, venue, paidRent);
  }

  renderBoardEconomy();
  renderTurnState();
}

async function moveCurrentPlayer(steps) {
  const currentPlayer = activePlayers[currentTurnIndex];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stepDelay = reducedMotion ? 70 : 280;

  for (let step = 0; step < steps; step += 1) {
    const oldSpace = document.querySelector(`[data-space-index="${positions[currentPlayer.id]}"]`);
    oldSpace?.classList.remove("board-space--landed");
    positions[currentPlayer.id] = (positions[currentPlayer.id] + 1) % config.boardSpaces.length;
    if (positions[currentPlayer.id] === 0) {
      balances[currentPlayer.id] += 200;
      logAction(`${currentPlayer.name} passed GO and collected ${formatMoney(200)}`);
    }
    renderTokens();
    const newSpace = document.querySelector(`[data-space-index="${positions[currentPlayer.id]}"]`);
    newSpace?.classList.add("board-space--landed");
    await wait(stepDelay);
  }

  const landedSpace = config.boardSpaces[positions[currentPlayer.id]];
  boardHint.textContent = `${currentPlayer.name} landed on ${landedSpace.label}.`;
  logAction(`${currentPlayer.name} rolled ${steps} → ${landedSpace.label}`);
  await wait(reducedMotion ? 80 : 350);
  await handleLanding(currentPlayer, landedSpace);
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
  familyAudio?.start();
  previewDialog.close();
  initialiseBoardGame();
  showScreen(gameScreen, characterScreen);
});

document.querySelector("#close-preview").addEventListener("click", () => previewDialog.close());
document.querySelector("#buy-venue").addEventListener("click", () => finishPurchaseChoice(true));
document.querySelector("#skip-venue").addEventListener("click", () => finishPurchaseChoice(false));
document.querySelector("#finish-build").addEventListener("click", finishBuildAnimation);
document.querySelector("#close-chance").addEventListener("click", finishChanceCard);
document.querySelector("#close-rent").addEventListener("click", finishRentAnimation);
rollButton.addEventListener("click", rollDice);

purchaseDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  finishPurchaseChoice(false);
});

buildDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  finishBuildAnimation();
});

chanceDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  finishChanceCard();
});

rentDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  finishRentAnimation();
});

previewDialog.addEventListener("click", (event) => {
  if (event.target === previewDialog) previewDialog.close();
});

renderCharacters();
updateSelection();
