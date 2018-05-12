const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env;

exports.incrementAttribute = ({ id, attr, by = 1, max = 9999999 }) =>
  dynamoDb
    .update({
      TableName: TABLE_NAME,
      Key: { id },
      ExpressionAttributeValues: {
        ":inc": by,
        ":max": max
      },
      ConditionExpression: `attribute_not_exists(${attr}) OR ${attr} < :max`,
      UpdateExpression: `ADD ${attr} :inc`
    })
    .promise();

exports.decrementAttribute = ({ id, attr, by = 1, min = 0 }) =>
  dynamoDb
    .update({
      TableName: TABLE_NAME,
      Key: { id },
      ExpressionAttributeValues: {
        ":dec": by * -1,
        ":min": min
      },
      ConditionExpression: `attribute_exists(${attr}) AND ${attr} > :min`,
      UpdateExpression: `ADD ${attr} :dec`
    })
    .promise();
