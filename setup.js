let matchPoints = 1000;
let matchPlayers = 2;
let players = [];
let diceBag = [];
let round = 1;
let actionsByRound = [[]];
let gameOver = false;
let gameStateHistory = [];

function saveGameStateSnapshot() {
  const snapshot = {
    round,
    matchPoints,
    matchPlayers,
    players: JSON.parse(JSON.stringify(players)),
    diceBag: [...diceBag],
    actionsByRound: JSON.parse(JSON.stringify(actionsByRound)),
    gameOver
  };
  gameStateHistory.push(snapshot);
}

function undoLastAction() {
  if (gameStateHistory.length === 0) {
    alert("No hay acciones para deshacer.");
    return;
  }

  const last = gameStateHistory.pop();

  round = last.round;
  matchPoints = last.matchPoints;
  matchPlayers = last.matchPlayers;
  players = last.players;
  diceBag = last.diceBag;
  actionsByRound = last.actionsByRound;
  gameOver = last.gameOver;

  renderGame();
}

function rollObjective() {
  const r = Math.floor(Math.random() * 6);
  document.getElementById("missionObjective").textContent = missions.objectives[r];
  currentObjectiveDescription = missions.objectivesInfo[r];
}

function rollZone() {
  const r = Math.floor(Math.random() * 6);
  document.getElementById("missionZones").textContent = missions.zones[r];
  currentZoneDescription = missions.zonesInfo[r];
}

function rollType() {
  const r = Math.floor(Math.random() * 6);
  document.getElementById("missionType").textContent = missions.types[r];
  currentTypeDescription = missions.typesInfo[r];
}

function showObjectiveInfo() {
  document.getElementById("missionInfoText").textContent = currentObjectiveDescription || "Ninguna misión asignada aún.";
  document.getElementById("missionInfoModal").classList.remove("hidden");
}

function showZoneInfo() {
  document.getElementById("missionInfoText").textContent = currentZoneDescription || "No hay zona seleccionada.";
  document.getElementById("missionInfoModal").classList.remove("hidden");
}

function showTypeInfo() {
  document.getElementById("missionInfoText").textContent = currentTypeDescription || "No hay tipo definido.";
  document.getElementById("missionInfoModal").classList.remove("hidden");
}

function closeMissionInfo() {
  document.getElementById("missionInfoModal").classList.add("hidden");
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
  const container = document.getElementById('playerInputs');
  container.innerHTML = '';
  for (let i = 0; i < matchPlayers; i++) {
    container.innerHTML += `
      <div id="player-card-${i}" style="border:2px solid #906931;padding:10px;margin:10px 0;border-radius:8px;">
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

function initializeGame() {
  saveGameStateSnapshot();

  players.length = 0;
  diceBag.length = 0;
  round = 1;
  gameOver = false;
  actionsByRound.length = 0;
  actionsByRound.push([]);

  for (let i = 0; i < matchPlayers; i++) {
    const name = document.getElementById(`name-${i}`).value || `Jugador ${i + 1}`;
    const nation = document.getElementById(`nation-${i}`).value;
    const dice = +document.getElementById(`dice-${i}`).value;

    const qty = +document.getElementById(`cmdQty-${i}`).value;
    const type = qty > 0 ? document.getElementById(`cmdType-${i}-0`).value : null;

    players.push({
      name,
      nation,
      diceTotal: dice,
      diceLeft: dice,
      orders: [],
      losses: 0,
      cmdType: type // platoon o company
    });

    for (let k = 0; k < dice; k++) diceBag.push(i);
  }

  shuffle(diceBag);
  renderGame();
}

function resetGame() {
  const confirmar = confirm("¿Estás seguro de que deseas reiniciar la partida? Se perderá todo el progreso.");
  if (!confirmar) return;

  // Reinicia todos los valores a su estado inicial
  matchPoints = 1000;
  matchPlayers = 2;
  players = [];
  diceBag = [];
  round = 1;
  actionsByRound = [[]];
  gameOver = false;
  gameStateHistory = [];

  // Oculta secciones de juego y muestra configuración inicial
  document.getElementById('game').classList.add('hidden');
  document.getElementById('playerSetup').classList.add('hidden');
  document.getElementById('matchSetup').classList.remove('hidden');

  // Reinicia inputs
  document.getElementById('gamePoints').value = 1000;
  document.getElementById('pointsValue').textContent = 1000;
  document.getElementById('numPlayers').value = 2;
  document.getElementById('missionObjective').textContent = '—';
  document.getElementById('missionZones').textContent = '—';
  document.getElementById('missionType').textContent = '—';
  document.getElementById('matchWarning').style.display = 'none';

  // Limpiar contenedores
  document.getElementById('playerInputs').innerHTML = '';
  document.getElementById('playerCards').innerHTML = '';
  document.getElementById('history').innerHTML = '';
  document.getElementById('summaryPoints').textContent = '—';
  document.getElementById('summaryObjective').textContent = '—';
  document.getElementById('summaryZones').textContent = '—';
  document.getElementById('summaryType').textContent = '—';

  // Cierra modales si están abiertos
  document.getElementById('casualtyModal').classList.add('hidden');
  document.getElementById('maintenanceModal').classList.add('hidden');
  document.getElementById('orderModal').classList.add('hidden');
  document.getElementById('gameEndModal').classList.add('hidden');
}

// Hacerla accesible desde el HTML
window.resetGame = resetGame;
