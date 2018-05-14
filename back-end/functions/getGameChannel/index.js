const uuid = require("uuid/v4");
const AWS = require("aws-sdk");
const jwt = require("jwt-simple");
const db = require("./shared/datastore");
const pusher = require("./shared/pusher");

const {
  MAX_PLAYERS,
  CHANNEL_PREFIX,
  PLAYER_PREFIX
} = require("./shared/constants");
const { JWT_SECRET } = process.env;

const stepFunctions = new AWS.StepFunctions();

module.exports = async (event, context) => {
  const { socket_id, user_name } = event.queryStringParameters;

  const userId = PLAYER_PREFIX + uuid();

  const runningGames = await getRunningGames();
  const channels = await pusher.getChannels();

  // find open games
  let gameId = Object.keys(channels).find(id => !runningGames.includes(id));

  // use new gameId if no open game is available
  if (!gameId) gameId = CHANNEL_PREFIX + uuid();

  let gameFound = false;
  do {
    try {
      await db.addPlayer(gameId, userId);
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
    user_id: userId,
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

  const payload = { gameId, userId: presenceData.user_id };
  const gameToken = jwt.encode(payload, JWT_SECRET);

  return {
    body: { gameId, auth, gameToken }
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
