const Pusher = require("pusher");
const { PRESENCE_PREFIX } = require("./constants");

const { APP_ID, APP_KEY, SECRET_KEY } = process.env;
const pusher = new Pusher({
  appId: APP_ID,
  key: APP_KEY,
  secret: SECRET_KEY
});

exports.authenticate = pusher.authenticate.bind(pusher);
exports.trigger = pusher.trigger.bind(pusher);

exports.getChannels = () =>
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
