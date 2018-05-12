const AWS = require("aws-sdk");
const stepFunctions = new AWS.StepFunctions();

const { MAX_PLAYERS } = require("./shared/constants");
const db = require("./shared/datastore");
const pusher = require("./shared/pusher");

module.exports = async (lambdaEvent, context) => {
  const { events } = lambdaEvent.body;

  for (let pusherEvent of events) {
    const { channel, name, user_id } = pusherEvent;
    if (name == "member_added") await processMemberAdded(channel, user_id);
    if (name == "member_removed") await processMemberRemoved(channel, user_id);
  }

  return { statusCode: 200 };
};

const { GAME_STATE_MACHINE_ARN } = process.env;

const processMemberAdded = async (gameId, userId) => {
  const channels = await pusher.getChannels();

  if (channels[gameId].user_count != MAX_PLAYERS) return;

  const executionParams = {
    stateMachineArn: GAME_STATE_MACHINE_ARN,
    input: JSON.stringify({ gameId }),
    name: gameId
  };

  await stepFunctions.startExecution(executionParams).promise();
};

const processMemberRemoved = async (gameId, userId) => {
  try {
    await db.decrementAttribute({ id: gameId, attr: "PlayerCount" });
  } catch (e) {
    console.log(e);
  }
};
