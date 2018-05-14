const jwt = require("jwt-simple");
const db = require("./shared/datastore");
const pusher = require("./shared/pusher");

const { JWT_SECRET } = process.env;

module.exports = async (event, context) => {
  const received = Date.now();

  const { clicks, gameToken } = event.queryStringParameters;

  let userId, gameId;
  try {
    const tokenData = jwt.decode(gameToken, JWT_SECRET);
    userId = tokenData.userId;
    gameId = tokenData.gameId;
  } catch (e) {
    return {
      statusCode: 403,
      body: { message: "No permission for this game." }
    };
  }

  await db.addSale(gameId, userId, clicks, received);

  pusher.trigger(gameId, "player:sold", { userId });

  return {
    body: {}
  };
};
