function renderCards() {
  const container = document.getElementById('playerCards');
  container.innerHTML = '';

  players.forEach((pl, i) => {
    const nation = nations.find(n => n.name === pl.nation);

    const badges = pl.orders.length
      ? pl.orders.map(o =>
          `<span class="order-badge ${o}">${orderIcons[o] || ''} ${o}</span>`
        ).join('')
      : '<span style="color:rgba(255,255,255,0.3);font-size:0.8rem;">Sin órdenes</span>';

    let cardHTML = `<div class="player-card" style="background:${nation.color}">
      <h4>${nation.emoji} ${pl.name}</h4>
      <div class="dice-count">${pl.diceLeft}</div>
      <div class="dice-label">de ${pl.diceTotal} dados</div>
      <div class="orders-row">${badges}</div>
      <button onclick="declareDown(${i})">⬇️ Down</button>`;

    if (pl.orders.includes('Ambush')) {
      cardHTML += `<button onclick="convertAmbush(${i})">🔥 Disparar</button>`;
    }

    cardHTML += `</div>`;
    container.innerHTML += cardHTML;
  });
}

function updateBagCount(diceBag) {
  const el = document.getElementById('bagCount');
  el.textContent = diceBag.length;
  el.classList.toggle('empty', diceBag.length === 0);
}

function updateHistory() {
  const h = document.getElementById('history');
  h.innerHTML = '';

  actionsByRound.forEach((list, idx) => {
    const roundBlock = document.createElement('details');
    roundBlock.innerHTML = `
      <summary>Ronda ${idx + 1}</summary>
      <ul>
        ${list.length > 0
          ? list.map(a => `<li>${a}</li>`).join('')
          : '<li><em>(Sin acciones registradas)</em></li>'
        }
      </ul>
    `;
    h.appendChild(roundBlock);
  });
}

function renderGame() {
  document.getElementById('playerSetup').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  document.getElementById('roundCounter').textContent = round;
  updateBagCount(diceBag);
  renderCards();
  updateHistory();

  const summary = document.getElementById('matchSummary');
  summary.classList.remove('hidden');
  document.getElementById('summaryPoints').textContent = matchPoints;
  document.getElementById('summaryObjective').textContent =
    document.getElementById('missionObjective').textContent;
  document.getElementById('summaryZones').textContent =
    document.getElementById('missionZones').textContent;
  document.getElementById('summaryType').textContent =
    document.getElementById('missionType').textContent;
}

function exportGameLog() {
  let log = `=== Emulador de Bolt Action ===\n\n`;
  log += `🎯 Objetivo: ${document.getElementById('missionObjective').textContent}\n`;
  log += `🗺️ Zonas: ${document.getElementById('missionZones').textContent}\n`;
  log += `⚔️ Tipo de Enfrentamiento: ${document.getElementById('missionType').textContent}\n`;
  log += `🎲 Puntos por jugador: ${matchPoints}\n`;
  log += `👥 Jugadores:\n`;

  players.forEach(p => {
    log += `  - ${p.name} (${p.nation})\n`;
  });

  log += `\n📜 Historial por Ronda:\n`;

  actionsByRound.forEach((acciones, idx) => {
    log += `\n🔁 Ronda ${idx + 1}\n`;
    if (acciones.length > 0) {
      acciones.forEach(act => { log += `  - ${act}\n`; });
    } else {
      log += `  (Sin acciones registradas)\n`;
    }
  });

  const blob = new Blob([log], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'historial_bolt_action.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
