const config = window.GAME_CONFIG;
const homeScreen = document.querySelector("#home-screen");
const characterScreen = document.querySelector("#character-screen");
const characterGrid = document.querySelector("#character-grid");
const selectedCount = document.querySelector("#selected-count");
const selectedNames = document.querySelector("#selected-names");
const confirmPlayers = document.querySelector("#confirm-players");
const previewDialog = document.querySelector("#preview-dialog");
const previewMessage = document.querySelector("#preview-message");
const selected = new Set();

function showScreen(screenToShow, screenToHide) {
  screenToHide.classList.remove("screen--active");
  window.setTimeout(() => {
    screenToHide.hidden = true;
    screenToShow.hidden = false;
    window.requestAnimationFrame(() => screenToShow.classList.add("screen--active"));
  }, 180);
}

function renderCharacters() {
  characterGrid.innerHTML = config.characters.map((character) => `
    <button class="character-card" type="button" data-character-id="${character.id}" aria-pressed="false">
      <span class="character-glow" style="--character-colour: ${character.colour}"></span>
      <span class="character-avatar" style="--character-colour: ${character.colour}" aria-hidden="true">${character.emoji}</span>
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

confirmPlayers.addEventListener("click", () => {
  const names = config.characters.filter(({ id }) => selected.has(id)).map(({ name }) => name);
  previewMessage.textContent = `${names.join(", ")} are ready to explore Kryspinów together.`;
  previewDialog.showModal();
});

document.querySelector("#close-preview").addEventListener("click", () => previewDialog.close());

previewDialog.addEventListener("click", (event) => {
  if (event.target === previewDialog) previewDialog.close();
});

renderCharacters();
updateSelection();
