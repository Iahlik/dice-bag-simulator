const nations = [
  { name: 'Estados Unidos', emoji: '🇺🇸', color: '#1E3A5F' },
  { name: 'Italia', emoji: '🇮🇹', color: '#006B3C' },
  { name: 'Japón', emoji: '🇯🇵', color: '#BC002D' },
  { name: 'Alemania', emoji: '🇩🇪', color: '#000000' },
  { name: 'Unión Soviética', emoji: '🇷🇺', color: '#CC0000' },
  { name: 'Inglaterra', emoji: '🇬🇧', color: '#00247D' },
  { name: 'Francia', emoji: '🇫🇷', color: '#0055A4' }
];

const missions = {
  objectives: [
    "Seek and Destroy", "Key Positions", "Breakthrough",
    "Top Secret", "Demolition", "Hold Until Relieved"
  ],
  zones: ["Long Edges", "Long Edges", "Long Edges", "Quarters", "Quarters", "Quarters"],
  types: ["Meeting Engagement", "Meeting Engagement", "Meeting Engagement", "Prepared Positions", "Prepared Positions", "Fog of War"]
};

let players = [], diceBag = [], round = 1, actionsByRound = [[]], gameOver = false;
let matchPoints = 1000, matchPlayers = 2;

function rollObjective() {
  const r = Math.floor(Math.random() * 6);
  document.getElementById("missionObjective").textContent = missions.objectives[r];
}

function rollZone() {
  const r = Math.floor(Math.random() * 6);
  document.getElementById("missionZones").textContent = missions.zones[r];
}

function rollType() {
  const r = Math.floor(Math.random() * 6);
  document.getElementById("missionType").textContent = missions.types[r];
}

function confirmMatchSetup() {
  const points = +document.getElementById("gamePoints").value;
  const numPlayers = +document.getElementById("numPlayers").value;
  const obj = document.getElementById("missionObjective").textContent;
  const zone = document.getElementById("missionZones").textContent;
  const type = document.getElementById("missionType").textContent;
  const warning = document.getElementById("matchWarning");

  if (!points || numPlayers < 1 || obj === "—" || zone === "—" || type === "—") {
    warning.style.display = "block";
    return;
  }

  warning.style.display = "none";

  matchPoints = points;
  matchPlayers = numPlayers;

  document.getElementById("matchSetup").classList.add("hidden");
  document.getElementById("playerSetup").classList.remove("hidden");


  setupPlayers();
}

function setupPlayers() {
  const num = matchPlayers;
  const container = document.getElementById('playerInputs');
  container.innerHTML = '';
  for (let i = 0; i < num; i++) {
    container.innerHTML += `
      <div id="player-card-${i}" style="border:2px solid #906931;padding:10px;margin:10px 0;border-radius:8px; transition: background 0.4s ease;">
        <h4>Jugador ${i + 1}</h4>
        <label>Nombre:</label>
        <input id="name-${i}" placeholder="Jugador ${i + 1}">
        <label>Nación:</label>
        <select id="nation-${i}" onchange="updatePlayerCardColor(${i})">
          ${nations.map(n => `<option value="${n.name}">${n.emoji} ${n.name}</option>`).join('')}
        </select>
        <label>Dados:</label>
        <input type="number" id="dice-${i}" min="1" value="5">
        <label>Comandantes:</label>
        <input type="number" id="cmdQty-${i}" min="0" value="1" onchange="updateCommanderTypes(${i})">
        <div id="cmdTypes-${i}"></div>
      </div>`;
    updateCommanderTypes(i);
    updatePlayerCardColor(i);
  }
}

function updateCommanderTypes(i) {
  const count = +document.getElementById(`cmdQty-${i}`).value;
  const div = document.getElementById(`cmdTypes-${i}`);
  div.innerHTML = '';
  for (let j = 0; j < count; j++) {
    div.innerHTML += `
      <label>Tipo Cmd ${j + 1}:</label>
      <select id="cmdType-${i}-${j}">
        <option value="platoon">Pelotón</option>
        <option value="company">Compañía</option>
      </select>`;
  }
}

function updatePlayerCardColor(i) {
  const nation = document.getElementById(`nation-${i}`).value;
  const color = (nations.find(n => n.name === nation) || {}).color || '#444';
  document.getElementById(`player-card-${i}`).style.background = color;
}

const orderIcons = {
  Advance: '➡️',
  Run: '🏃‍♂️',
  Ambush: '👀',
  Fire: '🔥',
  Rally: '🛡️',
  Down: '⬇️'
};

function initializeGame() {
  players = [];
  diceBag = [];
  round = 1;
  gameOver = false;
  actionsByRound = [[]];

  for (let i = 0; i < matchPlayers; i++) {
    const name = document.getElementById(`name-${i}`).value || `Jugador ${i + 1}`;
    const nation = document.getElementById(`nation-${i}`).value;
    const dice = +document.getElementById(`dice-${i}`).value;
    players.push({ name, nation, diceTotal: dice, diceLeft: dice, orders: [], losses: 0 });
    for (let k = 0; k < dice; k++) diceBag.push(i);
  }
  shuffle(diceBag);
  renderGame();
}

// Limpia las órdenes no persistentes
players.forEach(pl => {
  pl.orders = pl.orders.filter(o => o === 'Down' || o === 'Ambush');
});

function renderGame() {
  document.getElementById('playerSetup').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  document.getElementById('roundCounter').textContent = round;
  updateBagCount();
  renderCards();
  updateHistory();
}

let currentPlayerIndex = null;

function drawDice() {
  if (diceBag.length === 0 || gameOver || currentPlayerIndex !== null) return;

  const idx = diceBag.pop();
  const pl = players[idx];
  pl.diceLeft--;
  currentPlayerIndex = idx;

  document.getElementById('orderPlayerName').textContent = pl.name;
  document.getElementById('orderModal').classList.remove('hidden');
  updateBagCount();
}

function confirmModalOrder() {
  const ord = document.getElementById('orderSelect').value;
  const pl = players[currentPlayerIndex];

  pl.orders.push(ord);
  actionsByRound[round - 1].push(`${pl.name} → ${ord}`);
  currentPlayerIndex = null;

  document.getElementById('orderModal').classList.add('hidden');
  renderCards();
  updateHistory();
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
  updateBagCount();
  updateHistory();
  checkForGameEnd();
}

function nextRound() {
  if (diceBag.length > 0) return alert('Aún quedan dados en la bolsa.');
  const div = document.getElementById('casualtyInputs');
  div.innerHTML = '';
  players.forEach((pl, i) => {
    div.innerHTML += `<label>${pl.name} unidades muertas:</label><input type="number" min="0" max="${pl.diceLeft}" id="loses-${i}" value="0">`;
  });
  document.getElementById('casualtyModal').classList.remove('hidden');
}

function confirmCasualties() {
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
      if (down) div.innerHTML += `<label>Unidades en Down: ${down}</label><input type="number" id="keepDown-${i}" min="0" max="${down}" value="${down}">`;
      if (ambush) div.innerHTML += `<label>Unidades en Emboscada: ${ambush}</label><input type="number" id="keepAmbush-${i}" min="0" max="${ambush}" value="${ambush}">`;
    }
  });
  document.getElementById("maintenanceModal").classList.remove("hidden");
}

// 🔄 Función utilitaria
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// 📋 Renderizado de UI
function renderCards() {
  const c = document.getElementById('playerCards');
  c.innerHTML = '';

  players.forEach((pl, i) => {
    const nation = nations.find(n => n.name === pl.nation);

const orderList = pl.orders.length
  ? `<ul class="order-list">${pl.orders.map(o => `<li>${orderIcons[o] || '🏅'} ${o}</li>`).join('')}</ul>`
  : '—';

    let cardHTML = `<div class="player-card" style="background:${nation.color}">
      <h4>${nation.emoji} ${pl.name}</h4>
      <p>🎲 Dados: ${pl.diceLeft}/${pl.diceTotal}</p>
      <p><strong>Órdenes:</strong><br>${orderList}</p>
      <button onclick="declareDown(${i})">⬇️ Down</button>`;

    if (pl.orders.includes("Ambush")) {
      cardHTML += `<button onclick="convertAmbush(${i})">🔥 Disparar (Fire)</button>`;
    }

    cardHTML += `</div>`;
    c.innerHTML += cardHTML;
  });
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


function updateBagCount() {
  document.getElementById('bagCount').textContent = diceBag.length;
}

function updateHistory() {
  const h = document.getElementById('history');
  h.innerHTML = ''; // Limpia

  actionsByRound.forEach((list, idx) => {
    if (list.length > 0) {
      const roundBlock = document.createElement("details");
      roundBlock.innerHTML = `
        <summary>Ronda ${idx + 1}</summary>
        <ul>${list.map(a => `<li>${a}</li>`).join('')}</ul>
      `;
      h.appendChild(roundBlock);
    }
  });
}

// 🧠 Control del juego y lógica
// Reemplazo de la función confirmMaintenance con historial y reseteo de órdenes
function confirmMaintenance() {
  if (round >= 8) {
    endGame("Fin del juego: se alcanzó el límite de rondas.");
    return;
  }

  players.forEach((pl, i) => {
    const kd = document.getElementById(`keepDown-${i}`);
    const ka = document.getElementById(`keepAmbush-${i}`);
    let d = kd ? +kd.value : 0, a = ka ? +ka.value : 0;
    const kept = { down: 0, ambush: 0 };
    const newOrders = [];

    for (let o of pl.orders) {
      if (o === 'Down' && d-- > 0) {
        newOrders.push(o);
        kept.down++;
      } else if (o === 'Ambush' && a-- > 0) {
        newOrders.push(o);
        kept.ambush++;
      }
    }

    if (kept.down > 0) {
      actionsByRound[round - 1].push(`${pl.name} mantiene ${kept.down} unidad(es) en Down`);
    }
    if (kept.ambush > 0) {
      actionsByRound[round - 1].push(`${pl.name} mantiene ${kept.ambush} unidad(es) en Ambush`);
    }

    pl.orders = newOrders;
    pl.diceLeft = pl.diceTotal - newOrders.length;
  });

  diceBag = [];
  players.forEach((pl, i) => {
    for (let k = 0; k < pl.diceLeft; k++) diceBag.push(i);
  });

  shuffle(diceBag);
  round++;

  if (round === 7) {
    document.getElementById("gameEndModal").classList.remove("hidden");
    return;
  }

  actionsByRound.push([]);
  document.getElementById("maintenanceModal").classList.add("hidden");
  renderGame();
  checkForGameEnd();
}

function rollEndGameDice() {
  const roll = Math.ceil(Math.random() * 6);
  const resultText = document.getElementById("endGameResult");
  const confirmBtn = document.getElementById("confirmEndGameBtn");

  if (roll <= 3) {
    resultText.textContent = `🎲 Resultado: ${roll}. El juego ha terminado.`;
    endGame("El juego terminó tras la Ronda 6.");
  } else {
    resultText.textContent = `🎲 Resultado: ${roll}. Se juega una Ronda adicional (Turno 7).`;
    actionsByRound.push([]);
    renderGame();
  }

  confirmBtn.classList.remove("hidden");
}

function closeEndGameModal() {
  document.getElementById("gameEndModal").classList.add("hidden");
}

function endGame(reason) {
  gameOver = true;
  actionsByRound[round - 1].push(reason);
  updateHistory();
  alert(reason);
}

function checkForGameEnd() {
  if (players.some(p => p.diceTotal <= 0)) {
    endGame("Fin del juego: un jugador quedó sin dados.");
  }
}