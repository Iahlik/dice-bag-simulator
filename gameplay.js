// gameplay.js corregido con Snap to Action funcionando correctamente

let currentPlayerIndex = null;

function drawDice() {
  if (diceBag.length === 0 || gameOver || currentPlayerIndex !== null) return;

  saveGameStateSnapshot();

  const idx = diceBag.pop();
  const pl = players[idx];
  pl.diceLeft--;
  currentPlayerIndex = idx;

  document.getElementById('orderPlayerName').textContent = pl.name;
  document.getElementById('orderModal').classList.remove('hidden');

  // 🟨 Establece color de fondo del modal según la nación del jugador
  const nation = nations.find(n => n.name === pl.nation);
  const modal = document.getElementById("orderModal");
  modal.style.backgroundColor = nation ? nation.color : "#444"; // fallback por si no hay color

  // Reset UI modal
  document.getElementById("commanderCheckContainer").classList.add("hidden");
  document.getElementById("isCommanderUsed").checked = false;
  document.getElementById("extraOrdersForm").classList.add("hidden");
  document.getElementById("extraOrdersForm").innerHTML = "";

  toggleCommanderOption();
  updateBagCount(diceBag);
}

function toggleCommanderOption() {
  const select = document.getElementById("orderSelect");
  const isDown = select.value === "Down";
  const container = document.getElementById("commanderCheckContainer");

  container.classList.toggle("hidden", isDown);
  if (isDown) {
    document.getElementById("isCommanderUsed").checked = false;
    toggleExtraOrderCount();
  }
}

function toggleExtraOrderCount() {
  const checked = document.getElementById("isCommanderUsed").checked;
  const ord = document.getElementById("orderSelect").value;
  const show = checked && ord !== "Down";

  const countInput = document.getElementById("extraOrderCount");
  if (countInput) {
    countInput.max = diceBag.filter(d => d === currentPlayerIndex).length;
    if (+countInput.value > countInput.max) {
      countInput.value = countInput.max;
    }
  }

  document.getElementById("extraOrderCountContainer").classList.toggle("hidden", !show);
  document.getElementById("extraOrdersForm").classList.toggle("hidden", !show);

  if (show) renderExtraOrderFields();
}

function renderExtraOrderFields() {
  const max = diceBag.filter(d => d === currentPlayerIndex).length;
  const count = Math.min(+document.getElementById("extraOrderCount").value, max);
  const container = document.getElementById("extraOrdersForm");
  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <label>Orden adicional ${i + 1}:</label>
      <select id="extraOrder-${i}">
        <option value="Advance">Advance</option>
        <option value="Run">Run</option>
        <option value="Ambush">Ambush</option>
        <option value="Fire">Fire</option>
        <option value="Rally">Rally</option>
        <option value="Down">Down</option>
      </select><br>`;
  }
}

function confirmModalOrder() {
  if (currentPlayerIndex === null) return;
  saveGameStateSnapshot();

  const ord = document.getElementById('orderSelect').value;
  const pl = players[currentPlayerIndex];
  pl.orders.push(ord);
  actionsByRound[round - 1].push(`${pl.name} → ${ord}`);

  const isCommander = document.getElementById("isCommanderUsed").checked;
  const extraOrderCount = +document.getElementById("extraOrderCount").value;

  if (isCommander && ord !== "Down") {
    actionsByRound[round - 1].push(`${pl.name} activó Snap to Action`);

    const available = diceBag.filter(d => d === currentPlayerIndex);
    if (available.length < extraOrderCount) {
      alert("No hay suficientes dados del jugador para las órdenes adicionales.");
      return;
    }

    for (let i = 0; i < extraOrderCount; i++) {
      const value = document.getElementById(`extraOrder-${i}`).value;
      const dieIndex = diceBag.findIndex(d => d === currentPlayerIndex);

      if (dieIndex !== -1) {
        diceBag.splice(dieIndex, 1);
        pl.orders.push(value);
        pl.diceLeft--;
        actionsByRound[round - 1].push(`${pl.name} da orden adicional a sí mismo → ${value}`);
      }
    }
  }

  currentPlayerIndex = null;
  document.getElementById('orderModal').classList.add('hidden');
  renderCards();
  updateHistory();
  updateBagCount(diceBag);
  checkForGameEnd();
}

function declareDown(i) {
  const pl = players[i];
  if (pl.diceLeft <= 0) return;

  const index = diceBag.lastIndexOf(i);
  if (index !== -1) diceBag.splice(index, 1);

  pl.diceLeft--;
  pl.orders.push('Down');
  actionsByRound[round - 1].push(`${pl.name} declara Down`);

  renderCards();
  updateBagCount(diceBag);
  updateHistory();
  checkForGameEnd();
}

function convertAmbush(i) {
  const pl = players[i];
  const index = pl.orders.indexOf("Ambush");
  if (index !== -1) {
    pl.orders[index] = "Fire";
    actionsByRound[round - 1].push(`${pl.name} cambió Ambush a Fire`);
    renderCards();
    updateHistory();
  }
}

function nextRound() {
  if (diceBag.length > 0) return alert('Aún quedan dados en la bolsa.');

  const div = document.getElementById('casualtyInputs');
  div.innerHTML = '';

  players.forEach((pl, i) => {
    div.innerHTML += `
      <label>${pl.name} unidades muertas:</label>
      <input type="number" min="0" max="${pl.diceLeft}" id="loses-${i}" value="0">
    `;
  });

  document.getElementById('casualtyModal').classList.remove('hidden');
}

function confirmCasualties() {
  saveGameStateSnapshot();
  players.forEach((pl, i) => {
    const l = +document.getElementById(`loses-${i}`).value;
    pl.losses += l;
    pl.diceTotal -= l;
    pl.diceLeft -= l;
    if (l > 0) actionsByRound[round - 1].push(`${pl.name} perdió ${l} unidad(es)`);
  });

  document.getElementById("casualtyModal").classList.add("hidden");
  showOrderMaintenanceModal();
}

function showOrderMaintenanceModal() {
  const div = document.getElementById("maintenanceInputs");
  div.innerHTML = "";

  players.forEach((pl, i) => {
    const down = pl.orders.filter(o => o === 'Down').length;
    const ambush = pl.orders.filter(o => o === 'Ambush').length;

    if (down > 0 || ambush > 0) {
      div.innerHTML += `<h4>${pl.name}</h4>`;
      if (down) {
        div.innerHTML += `<label>Unidades en Down: ${down}</label>
          <input type="number" id="keepDown-${i}" min="0" max="${down}" value="${down}">`;
      }
      if (ambush) {
        div.innerHTML += `<label>Unidades en Emboscada: ${ambush}</label>
          <input type="number" id="keepAmbush-${i}" min="0" max="${ambush}" value="${ambush}">`;
      }
    }
  });

  document.getElementById("maintenanceModal").classList.remove("hidden");
}

function checkForGameEnd() {
  if (players.some(p => p.diceTotal <= 0)) {
    endGame("Fin del juego: un jugador quedó sin dados.");
  }
}