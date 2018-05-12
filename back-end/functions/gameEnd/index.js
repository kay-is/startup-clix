const pusher = require("./shared/pusher");

module.exports = async (event, context) => {
  pusher.trigger(event.gameId, "game:end", { message: "Game ended." });
};
