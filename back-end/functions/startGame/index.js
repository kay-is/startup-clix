const AWS = require("aws-sdk");
const stepFunctions = new AWS.StepFunctions();

const GAME_ID = "presence-game-999";

console.log("Function loaded");

module.exports = async (event, context) => {
  console.log("Function started");
  const executionParams = {
    stateMachineArn: process.env.GAME_STATE_MACHINE_ARN,
    input: JSON.stringify({ gameId: GAME_ID })
  };

  console.log("Starting an execution...");
  const execution = await stepFunctions
    .startExecution(executionParams)
    .promise();
  console.log("Execution started!");

  return {
    body: { execution }
  };
};
