const Pusher = require("pusher");

const PRESENCE_PREFIX = "presence-";
const CHANNEL_PREFIX = PRESENCE_PREFIX + "game-";
const MAX_PLAYERS = 2;

module.exports = async (event, context) => {
  const channels = await getChannels();
  const channelIds = Object.keys(channels);

  let channelId = channelIds.find(id => channels[id].user_count < MAX_PLAYERS);

  if (!channelId) channelId = CHANNEL_PREFIX + channelIds.length;

  return {
    body: { channelId }
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
