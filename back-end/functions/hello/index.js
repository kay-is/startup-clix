const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.APP_KEY,
  secret: process.env.SECRET_KEY
});

exports.handler = (event, context, callback) => {
  console.log("Hello!");

  pusher.trigger("presence-game-999", "hello", {
    message: "hello world",
    timestamp: Date.now()
  });

  callback(null);
};
