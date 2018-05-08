const Pusher = require("pusher");

const PRESENCE_PREFIX = "presence-";
const MAX_PLAYERS = 2;

module.exports = async (event, context) => {
  const { socket_id, channel_name } = event.queryStringParameters;

  const channels = await getChannels();
  const channelIds = Object.keys(channels);

  if (channelIds.includes(channel_name)) {
    const channelFull = !channelIds.find(
      id => id === channel_name && channels[id].user_count < MAX_PLAYERS
    );

    if (channelFull)
      return {
        statusCode: 403,
        body: { message: "Channel full." }
      };
  }

  const presenceData = {
    user_id: socket_id,
    user_info: {
      name: "Player " + Math.random()
    }
  };

  let auth;
  try {
    auth = pusher.authenticate(socket_id, channel_name, presenceData);
  } catch (e) {
    return {
      statusCode: 403,
      body: { message: "Authentication with Pusher failed." }
    };
  }

  return {
    statusCode: 200,
    body: auth
  };
};

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.APP_KEY,
  secret: process.env.SECRET_KEY
});

const getChannels = () =>
  new Promise((resolve, reject) => {
    pusher.get(
      {
        path: "/channels",
        params: {
          filter_by_prefix: PRESENCE_PREFIX,
          info: ["user_count"]
        }
      },
      (error, request, response) => {
        if (response.statusCode === 200) {
          const result = JSON.parse(response.body);
          return resolve(result.channels);
        }
        reject(error);
      }
    );
  });
