const uuid = require("uuid/v4");
const AWS = require("aws-sdk");
const jwt = require("jwt-simple");
const db = require("./shared/datastore");
const pusher = require("./shared/pusher");

const { PLAYER_PREFIX } = require("./shared/constants");
const { JWT_SECRET } = process.env;

module.exports = async (event, context) => {
  const { socket_id, user_name, game_id } = event.queryStringParameters;

  const userId = PLAYER_PREFIX + uuid();

  const runningGames = await getRunningGames();

  if (runningGames.includes(game_id))
    return {
      statusCode: 423,
      message: "Game locked, it already started."
    };

  try {
    await db.addPrivatePlayer(game_id, userId);
  } catch (e) {
    if (e.code == "ConditionalCheckFailedException") {
      return {
        statusCode: 423,
        message: "Game locked, it has enough players."
      };
    }
    console.log(e);
    // Some other DynamoDB error occurred
    return { statusCode: 500 };
  }

  const presenceData = {
    user_id: userId,
    user_info: {
      name: user_name
    }
  };

  let auth;
  try {
    auth = pusher.authenticate(socket_id, game_id, presenceData);
  } catch (e) {
    return {
      statusCode: 403,
      body: { message: "Pusher authentication failed." }
    };
  }

  const gameToken = jwt.encode({ game_id, userId }, JWT_SECRET);

  return {
    body: { gameId: game_id, auth, gameToken }
  };
};

const stepFunctions = new AWS.StepFunctions();
const listExecutionsParams = {
  stateMachineArn: process.env.GAME_STATE_MACHINE_ARN,
  statusFilter: "RUNNING"
};
const getRunningGames = () =>
  stepFunctions
    .listExecutions(listExecutionsParams)
    .promise()
    .then(r => r.executions.map(e => e.name));
