const AWS = require("aws-sdk");
const { MAX_PLAYERS } = require("./constants");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env;

const parseSet = a => dynamoDb.createSet(a);
const db = action => params => dynamoDb[action](params).promise();
const update = db("update");
const remove = db("delete");
const get = db("get");

exports.addPlayer = (gameId, userId) =>
  update({
    TableName: TABLE_NAME,
    Key: { id: gameId },
    ExpressionAttributeValues: {
      ":user_id": parseSet([userId]),
      ":max": MAX_PLAYERS
    },
    ConditionExpression:
      "attribute_not_exists(Players) OR size(Players) < :max",
    UpdateExpression: "ADD Players :user_id"
  });

// FIXME: removing the userId from the Players set
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
