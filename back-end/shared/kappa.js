const lambda = require("../index.js");

exports.handler = (event, context, callback) =>
  lambda(event, context)
    .then(r => callback(null, r))
    .catch(callback);
