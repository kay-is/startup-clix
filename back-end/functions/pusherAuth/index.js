const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.APP_KEY,
  secret: process.env.SECRET_KEY
});

module.exports = async (event, context) => {
  const body = event.body.split("&");
  const socket_id = body[0].split("=")[1];
  const channel_name = body[1].split("=")[1];

  const presenceData = {
    user_id: socket_id,
    user_info: {
      name: "Player " + Math.random()
    }
  };

  const auth = pusher.authenticate(socket_id, channel_name, presenceData);

  return {
    statusCode: 200,
    body: JSON.stringify(auth)
  };
};
