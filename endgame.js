
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
    pl.diceLeft = Math.max(0, pl.diceTotal - newOrders.length);
  });

  diceBag.length = 0;
  players.forEach((pl, i) => {
    for (let k = 0; k < pl.diceLeft; k++) diceBag.push(i);
  });

  shuffle(diceBag);
  actionsByRound.push([]);
  round++;

  if (round === 7) {
    document.getElementById("gameEndModal").classList.remove("hidden");
    return;
  }

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
  }

  confirmBtn.classList.remove("hidden");
}

 function closeEndGameModal() {
  document.getElementById("gameEndModal").classList.add("hidden");
}

 function endGame(reason) {
  actionsByRound[round - 1].push(reason);
  alert(reason);
  renderGame(); // Render final
}

 function checkForGameEnd() {
  if (players.some(p => p.diceTotal <= 0)) {
    endGame("Fin del juego: un jugador quedó sin dados.");
  }
}
