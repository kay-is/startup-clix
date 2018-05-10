const uuid = require("uuid/v4");
const Pusher = require("pusher");
const AWS = require("aws-sdk");

const {
  CHANNEL_PREFIX,
  MAX_PLAYERS,
  PRESENCE_PREFIX
} = require("./shared/constants");

const stepFunctions = new AWS.StepFunctions();

module.exports = async (event, context) => {
  const { socket_id } = event.queryStringParameters;

  const runningGames = await getRunningGames();
  const channels = await getChannels();
  const channelIds = Object.keys(channels);

  let channelId = channelIds.find(
    id => channels[id].user_count < MAX_PLAYERS && !runningGames.includes(id)
  );

  if (!channelId) channelId = CHANNEL_PREFIX + uuid();

  const presenceData = {
    user_id: socket_id,
    user_info: {
      name: "Player " + socket_id
    }
  };

  let auth;
  try {
    auth = pusher.authenticate(socket_id, channelId, presenceData);
  } catch (e) {
    return {
      statusCode: 403,
      body: { message: "Authentication with Pusher failed." }
    };
  }

  return {
    body: { channelId, auth }
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

const listExecutionsParams = {
  stateMachineArn: process.env.GAME_STATE_MACHINE_ARN,
  statusFilter: "RUNNING"
};
const getRunningGames = () =>
  stepFunctions
    .listExecutions(listExecutionsParams)
    .promise()
    .then(r => r.executions.map(e => e.name));
