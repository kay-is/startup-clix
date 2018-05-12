const pusher = require("./shared/pusher");

module.exports = async (event, context) => {
  pusher.trigger(event.gameId, "game:start", { message: "Game started!" });

  return { gameId: event.gameId };
};
