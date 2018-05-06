const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.APP_KEY,
  secret: process.env.SECRET_KEY
});

exports.handler = (event, context, callback) =>
  pusher.get({ path: "/channels" }, (error, request, response) => {
    if (response.statusCode === 200)
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify("presence-game-999")
      });

    callback(error);
  });
