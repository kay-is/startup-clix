const lambda = require("../index.js");

exports.handler = (event, context, callback) => {
  if (event.body) event.body = JSON.parse(event.body);

  lambda(event, context)
    .then(r => {
      if (r) {
        if (r.body) r.body = JSON.stringify(r.body);

        if (event.queryStringParameters) {
          const jsonpCallback = event.queryStringParameters.callback;
          if (jsonpCallback) r.body = `${jsonpCallback}(${r.body})`;
        }
      }

      callback(null, r);
    })
    .catch(callback);
};
