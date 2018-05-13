import Pusher from "pusher-js";
import { APP_KEY, API_URL } from "./constants";
import fetchJsonp from "fetch-jsonp";

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
    const url = `${API_URL}getgamechannel?socket_id=${
      pusher.connection.socket_id
    }&user_name=${userName}`;

    return fetchJsonp(url)
      .then(r => r.json())
      .then(({ gameId, auth }) => {
        pusher.config.auth.preAuth[gameId] = auth;
        return gameId;
      });
  };

  return pusher;
};
