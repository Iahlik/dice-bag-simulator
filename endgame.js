function confirmMaintenance() {
  if (round >= 8) {
    endGame("Fin del juego: se alcanzó el límite de rondas.");
    return;
  }

  saveGameStateSnapshot(); // 🔄 Guarda antes de modificar

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
    pl.diceLeft = Math.max(0, pl.diceTotal - newOrders.length);
  });

  diceBag.length = 0;
  players.forEach((pl, i) => {
    for (let k = 0; k < pl.diceLeft; k++) diceBag.push(i);
  });

  shuffle(diceBag);
  actionsByRound.push([]);
  round++;

  document.getElementById("maintenanceModal").classList.add("hidden");

  if (round === 7) {
    document.getElementById("gameEndModal").classList.remove("hidden");
    return;
  }

  if (round === 8) {
    endGame("Fin del juego: se completaron todas las rondas.");
    return;
  }
  renderGame();
  checkForGameEnd();
}

function rollEndGameDice() {
  saveGameStateSnapshot(); // 🔄 Guarda antes de lanzar dado

  const roll = Math.ceil(Math.random() * 6);
  const resultText = document.getElementById("endGameResult");
  const confirmBtn = document.getElementById("confirmEndGameBtn");

  if (roll <= 3) {
    resultText.textContent = `🎲 Resultado: ${roll}. El juego ha terminado.`;
    confirmBtn.classList.remove("hidden");
    endGame("El juego terminó tras la Ronda 6.");
  } else {
    resultText.textContent = `🎲 Resultado: ${roll}. Se juega una Ronda adicional (Turno 7).`;
    confirmBtn.classList.remove("hidden");
  }
}

function closeEndGameModal() {
  document.getElementById("gameEndModal").classList.add("hidden");
  if (!gameOver) {
    renderGame();
  }
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
