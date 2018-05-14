import Pusher from "pusher-js";
import { APP_KEY } from "./constants";
import gameApiClient from "./gameApiClient";

const supportedAuthorizers = Pusher.Runtime.getAuthorizers();

supportedAuthorizers.preAuthenticated = function(context, socketId, callback) {
  const { authOptions, channel } = this;
  const authData = authOptions.preAuth[channel.name];

  if (authData) return callback(false, authOptions.preAuth[channel.name]);

  callback(true, "You need to pre-authenticate for channel: " + channel.name);
};

Pusher.Runtime.getAuthorizers = () => supportedAuthorizers;

export default () => {
  const pusher = new Pusher(APP_KEY, {
    auth: { preAuth: {} },
    authTransport: "preAuthenticated",
    cluster: "mt1",
    encrypted: true
  });

  pusher.getGameChannelId = function(userName) {
    return gameApiClient
      .getGameChannel(pusher.connection.socket_id, userName)
      .then(({ gameId, auth }) => {
        pusher.config.auth.preAuth[gameId] = auth;
        return gameId;
      });
  };

  return pusher;
};
