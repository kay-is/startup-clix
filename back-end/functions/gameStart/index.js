const db = require("./shared/datastore");
const pusher = require("./shared/pusher");

const START_CAPITAL = 30000;

module.exports = async event => {
  const game = await db.getGame(event.gameId);

  const activePlayers = {};
  const players = game.Players.values;

  players.forEach(p => {
    activePlayers[p] = { capital: START_CAPITAL };
  });

  event.activePlayerCount = players.length;
  event.activePlayers = activePlayers;

  pusher.trigger(event.gameId, "game:start", {
    capital: START_CAPITAL
  });

  return event;
};
