

let currentPlayerIndex = null;

// Función pública para uso externo
 function drawDice() {
  if (diceBag.length === 0 || currentPlayerIndex !== null) return;

  const idx = diceBag.pop();
  const pl = players[idx];
  pl.diceLeft--;
  currentPlayerIndex = idx;

  document.getElementById('orderPlayerName').textContent = pl.name;
  document.getElementById('orderModal').classList.remove('hidden');

  updateBagCount(diceBag);
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

// Prepara el modal de bajas al finalizar una ronda
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

// Aplica las bajas al confirmar
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

// Muestra el modal de órdenes persistentes
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
