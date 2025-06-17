

// Permite declarar una orden Down
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

// Convierte una orden Ambush en Fire
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
