const Pusher = require("pusher");
const { MAX_PLAYERS, PRESENCE_PREFIX } = require("./shared/constants");

const { APP_ID, APP_KEY, SECRET_KEY } = process.env;
const pusher = new Pusher({
  appId: APP_ID,
  key: APP_KEY,
  secret: SECRET_KEY
});

module.exports = async (lambdaEvent, context) => {
  const { events } = lambdaEvent.body;

  for (let pusherEvent of events) await processPusherEvent(pusherEvent);

  return { statusCode: 200 };
};

const processPusherEvent = async ({ channel, name }) => {
  if (name == "member_removed") return;

  const channels = await getChannels();

  if (channels[channel].user_count == MAX_PLAYERS) {
    pusher.trigger(channel, "game:start", { x: 123 });
  }
};

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
