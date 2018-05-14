const db = require("./shared/datastore");
const pusher = require("./shared/pusher");

const BURN_RATE = 5000;
const PROFIT_MULTIPLIER = 500000;

module.exports = async event => {
  const debug = data => pusher.trigger(event.gameId, "debug", data);
  const roundEnd = Date.now();

  const game = await db.getGame(event.gameId);

  const sales = game.Sales || [];

  Object.keys(event.activePlayers).forEach(userId => {
    let playerSale = sales.find(s => s.userId === userId);

    debug("Calculating profit for Player: " + userId);

    // player didn't sell a product this round
    if (!playerSale) playerSale = { clicks: 0, received: roundEnd };

    // the time it took to create the product
    const saleDuration = playerSale.received - event.roundStart;

    debug("saleDuration: " + saleDuration);

    const profit = PROFIT_MULTIPLIER * playerSale.clicks / saleDuration;

    debug("profit: " + profit);

    const oldCapital = event.activePlayers[userId].capital;

    event.activePlayers[userId].capital = parseInt(
      oldCapital - BURN_RATE + profit
    );

    if (event.activePlayers[userId].capital < 1)
      event.activePlayers[userId].lost = true;
  });

  pusher.trigger(event.gameId, "round:end", {
    players: event.activePlayers,
    message: "Round ended."
  });

  event.activePlayerCount = Object.keys(event.activePlayers).filter(
    userId => !event.activePlayers[userId].lost
  ).length;

  await db.clearSales(event.gameId);

  return event;
};
