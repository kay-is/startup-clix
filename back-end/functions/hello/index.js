const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.APP_KEY,
  secret: process.env.SECRET_KEY
});

module.exports = async (event, context) => {
  pusher.trigger("presence-game-999", "hello", {
    message: "hello world",
    timestamp: Date.now()
  });
};
