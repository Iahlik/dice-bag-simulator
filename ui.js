

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

// Actualiza historial por ronda
 function updateHistory() {
  const h = document.getElementById('history');
  h.innerHTML = '';

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

// Renderiza el juego en progreso
 function renderGame() {
  document.getElementById('playerSetup').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  document.getElementById('roundCounter').textContent = round;
  updateBagCount([]);
  renderCards();
  updateHistory();
}
