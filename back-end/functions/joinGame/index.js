const AWS = require("aws-sdk");
const stepFunctions = new AWS.StepFunctions();

const GAME_ID = "presence-game-999";

console.log("Function loaded");

module.exports = async (event, context) => {
  console.log("Function started");
  let task;
  {
    const getTaskParams = {
      activityArn: process.env.JOIN_GAME_ACTIVITY_ARN
    };

    console.log("Getting task...");
    task = await stepFunctions.getActivityTask(getTaskParams).promise();
    console.log("Got task!");
  }

  const input = JSON.parse(task.input);
  {
    const { taskToken } = task;

    const taskSuccessParams = {
      taskToken,
      output: JSON.stringify(input)
    };

    console.log("Sending task success...");
    await stepFunctions.sendTaskSuccess(taskSuccessParams).promise();
    console.log("Success sent!");
  }

  return {
    body: {
      gameIdsMatch: input.gameId == GAME_ID
    }
  };
};
