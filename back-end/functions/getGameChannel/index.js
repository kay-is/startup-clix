const uuid = require("uuid/v4");
const AWS = require("aws-sdk");
const db = require("./shared/datastore");
const pusher = require("./shared/pusher");

const { MAX_PLAYERS, CHANNEL_PREFIX } = require("./shared/constants");

const stepFunctions = new AWS.StepFunctions();

module.exports = async (event, context) => {
  const { socket_id, user_name } = event.queryStringParameters;

  const runningGames = await getRunningGames();
  const channels = await pusher.getChannels();

  // find open games
  let gameId = Object.keys(channels).find(id => !runningGames.includes(id));

  // use new gameId if no open game is available
  if (!gameId) gameId = CHANNEL_PREFIX + uuid();

  let gameFound = false;
  do {
    try {
      // add player to new game in db
      await db.incrementAttribute({
        id: gameId,
        attr: "PlayerCount",
        max: MAX_PLAYERS
      });
      gameFound = true;
    } catch (e) {
      // All games are full OR have already started, creating a new one
      if (e.code == "ConditionalCheckFailedException") {
        gameId = CHANNEL_PREFIX + uuid();
        continue;
      }
      // Some other DynamoDB error occurred
      console.log(e);
      return { statusCode: 500 };
    }
  } while (!gameFound);

  const presenceData = {
    user_id: socket_id,
    user_info: {
      name: user_name
    }
  };

  let auth;
  try {
    auth = pusher.authenticate(socket_id, gameId, presenceData);
  } catch (e) {
    return {
      statusCode: 403,
      body: { message: "Pusher authentication failed." }
    };
  }

  return {
    body: { gameId, auth }
  };
};

const listExecutionsParams = {
  stateMachineArn: process.env.GAME_STATE_MACHINE_ARN,
  statusFilter: "RUNNING"
};
const getRunningGames = () =>
  stepFunctions
    .listExecutions(listExecutionsParams)
    .promise()
    .then(r => r.executions.map(e => e.name));
