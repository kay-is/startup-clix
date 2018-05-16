const AWS = require("aws-sdk");
const { MAX_PLAYERS } = require("./constants");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env;

const parseSet = a => dynamoDb.createSet(a);
const db = action => params => dynamoDb[action](params).promise();
const update = db("update");
const remove = db("delete");
const get = db("get");

exports.createGame = (
  gameId,
  userId,
  maxPlayers = MAX_PLAYERS,
  privateGame = false
) =>
  update({
    TableName: TABLE_NAME,
    Key: { id: gameId },
    ExpressionAttributeValues: {
      ":user_id": parseSet([userId]),
      ":max": parseInt(maxPlayers),
      ":private_game": privateGame
    },
    UpdateExpression:
      "SET Players = :user_id, MaxPlayers = :max, PrivateGame = :private_game"
  });

exports.addPrivatePlayer = (gameId, userId) =>
  update({
    TableName: TABLE_NAME,
    Key: { id: gameId },
    ExpressionAttributeValues: {
      ":user_id": parseSet([userId])
    },
    ConditionExpression:
      "attribute_not_exists(Players) OR size(Players) < MaxPlayers",
    UpdateExpression: "ADD Players :user_id"
  });

exports.addPlayer = (gameId, userId) =>
  update({
    TableName: TABLE_NAME,
    Key: { id: gameId },
    ExpressionAttributeValues: {
      ":user_id": parseSet([userId]),
      ":no_private_game": false
    },
    ConditionExpression:
      "(PrivateGame = :no_private_game) AND (attribute_not_exists(Players) OR (size(Players) < MaxPlayers))",
    UpdateExpression: "ADD Players :user_id"
  });

exports.removePlayer = (gameId, userId) =>
  update({
    TableName: TABLE_NAME,
    Key: { id: gameId },
    ExpressionAttributeValues: {
      ":user_id": parseSet([userId]),
      ":min": 0
    },
    ConditionExpression: "attribute_exists(Players) AND size(Players) > :min",
    UpdateExpression: "DELETE Players :user_id"
  });

exports.addSale = (gameId, userId, clicks, received) =>
  update({
    TableName: TABLE_NAME,
    Key: { id: gameId },
    ExpressionAttributeValues: {
      ":sale": [{ userId, clicks, received }],
      ":empty_list": []
    },
    UpdateExpression:
      "SET Sales = list_append(if_not_exists(Sales, :empty_list), :sale)"
  });

exports.clearSales = gameId =>
  update({
    TableName: TABLE_NAME,
    Key: { id: gameId },
    UpdateExpression: "REMOVE Sales"
  });

exports.deleteGame = gameId =>
  remove({
    TableName: TABLE_NAME,
    Key: { id: gameId }
  });

exports.getGame = gameId =>
  get({
    TableName: TABLE_NAME,
    Key: { id: gameId }
  }).then(r => r.Item);
