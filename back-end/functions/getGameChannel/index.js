const uuid = require("uuid/v4");
const AWS = require("aws-sdk");
const jwt = require("jwt-simple");
const db = require("./shared/datastore");
const pusher = require("./shared/pusher");

const { CHANNEL_PREFIX, PLAYER_PREFIX } = require("./shared/constants");
const { JWT_SECRET } = process.env;

const stepFunctions = new AWS.StepFunctions();

module.exports = async (event, context) => {
  const {
    socket_id,
    user_name,
    private_game,
    max_players
  } = event.queryStringParameters;

  const userId = PLAYER_PREFIX + uuid();

  if (private_game === "true") {
    const gameId = CHANNEL_PREFIX + uuid();
    await db.createGame(gameId, userId, max_players, true);

    const presenceData = {
      user_id: userId,
      user_info: { name: user_name }
    };

    const auth = pusher.authenticate(socket_id, gameId, presenceData);
    const gameToken = jwt.encode({ gameId, userId }, JWT_SECRET);

    return {
      body: { gameId, auth, gameToken, privateGame: private_game }
    };
  }

  // check for existing games that could be joined
  const runningGames = await getRunningGames();
  const gameChannels = await pusher.getChannels();

  // find games that haven't started yet
  const gameIds = Object.keys(gameChannels).filter(
    gameChannelId => !runningGames.includes(gameChannelId)
  );

  // try to join games that haven't started yet
  let openGameId;
  for (let gameId of gameIds) {
    try {
      await db.addPlayer(gameId, userId);

      // found a non-full game
      openGameId = gameId;
      break;
    } catch (e) {
      if (e.code === "ConditionalCheckFailedException") continue;

      // unexpected DynamoDB error occurred
      return { statusCode: 500, message: e.message };
    }
  }

  // all games had already started
  // or were full
  // or were private
  // or about to start
  // or there weren't any games
  if (!openGameId) {
    console.log("No game found, creating new one!");
    openGameId = CHANNEL_PREFIX + uuid();
    await db.createGame(openGameId, userId);
  }

  const presenceData = {
    user_id: userId,
    user_info: { name: user_name }
  };

  let auth;
  try {
    auth = pusher.authenticate(socket_id, openGameId, presenceData);
  } catch (e) {
    return {
      statusCode: 403,
      body: { message: "Pusher authentication failed." }
    };
  }

  const gameToken = jwt.encode({ gameId: openGameId, userId }, JWT_SECRET);

  return {
    body: { gameId: openGameId, auth, gameToken }
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
