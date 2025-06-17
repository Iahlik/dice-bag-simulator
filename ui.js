// Renderiza cartas de jugadores
function renderCards() {
  const container = document.getElementById('playerCards');
  container.innerHTML = '';

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
    container.innerHTML += cardHTML;
  });
}

// Actualiza contador de dados
function updateBagCount(diceBag) {
  document.getElementById('bagCount').textContent = diceBag.length;
}

// Actualiza historial por ronda (ahora incluye rondas vacías)
function updateHistory() {
  const h = document.getElementById('history');
  h.innerHTML = '';

  actionsByRound.forEach((list, idx) => {
    const roundBlock = document.createElement("details");
    roundBlock.innerHTML = `
      <summary>Ronda ${idx + 1}</summary>
      <ul>
        ${
          list.length > 0
            ? list.map(a => `<li>${a}</li>`).join('')
            : `<li><em>(Sin acciones registradas)</em></li>`
        }
      </ul>
    `;
    h.appendChild(roundBlock);
  });
}

// Renderiza el juego en progreso
function renderGame() {
  document.getElementById('playerSetup').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  document.getElementById('roundCounter').textContent = round;
  updateBagCount(diceBag);
  renderCards();
  updateHistory();
}

// Exporta historial completo a archivo .txt
function exportGameLog() {
  let log = `=== Emulador de Bolt Action ===\n\n`;
  log += `🎯 Objetivo: ${document.getElementById("missionObjective").textContent}\n`;
  log += `🗺️ Zonas: ${document.getElementById("missionZones").textContent}\n`;
  log += `⚔️ Tipo de Enfrentamiento: ${document.getElementById("missionType").textContent}\n`;
  log += `🎲 Puntos por jugador: ${matchPoints}\n`;
  log += `👥 Jugadores:\n`;

  players.forEach((p, i) => {
    log += `  - ${p.name} (${p.nation})\n`;
  });

  log += `\n📜 Historial por Ronda:\n`;

  actionsByRound.forEach((acciones, idx) => {
    log += `\n🔁 Ronda ${idx + 1}\n`;
    if (acciones.length > 0) {
      acciones.forEach(act => {
        log += `  - ${act}\n`;
      });
    } else {
      log += `  (Sin acciones registradas)\n`;
    }
  });

  const blob = new Blob([log], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `historial_bolt_action.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
