const pusher = require("./shared/pusher");

module.exports = async event => {
  event.roundStart = Date.now();

  pusher.trigger(event.gameId, "round:start", { message: "Round started." });

  return event;
};
