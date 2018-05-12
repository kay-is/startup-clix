Pusher.logToConsole = true;

const API_URL = "https://bf6s24gp94.execute-api.us-east-1.amazonaws.com/Prod/";

const APP_KEY = "2205eeb25f71d1ef40fd";

const supportedAuthorizers = Pusher.Runtime.getAuthorizers();

supportedAuthorizers.preAuthenticated = function(context, socketId, callback) {
  const { authOptions, channel } = this;
  const authData = authOptions.preAuth[channel.name];

  if (!authData) {
    callback(true, "You need to pre-authenticate" + channel.name);
  } else {
    callback(false, authOptions.preAuth[channel.name]);
  }
};

Pusher.Runtime.getAuthorizers = () => supportedAuthorizers;

const pusher = new Pusher(APP_KEY, {
  auth: { preAuth: {} },
  authTransport: "preAuthenticated",
  cluster: "mt1",
  encrypted: true
});

const onConnect = () =>
  fetchJsonp(
    API_URL + "getgamechannel?socket_id=" + pusher.connection.socket_id
  )
    .then(r => r.json())
    .then(({ gameId, auth }) => {
      pusher.config.auth.preAuth[gameId] = auth;

      const channel = pusher.subscribe(gameId);

      channel.bind("game:start", event => {
        document.getElementById("serverevent").innerHTML = "Game started!";
      });

      channel.bind("game:end", event => {
        document.getElementById("serverevent").innerHTML = "Game ended!";
      });

      const render = () => {
        const { members } = channel;

        document.getElementById("playercount").innerHTML = members.count;

        const players = [];
        members.each(member =>
          players.push(`<li class="list-group-item">${member.info.name}</li>`)
        );

        document.getElementById("playerlist").innerHTML = players.join("");
      };

      channel.bind("pusher:subscription_succeeded", render);
      channel.bind("pusher:subscription_error", error => {
        console.log("Channel error:", error);
      });
      channel.bind("pusher:subscription_succeeded", () => {
        console.log("Channel joined!");
      });
      channel.bind("pusher:member_added", render);
      channel.bind("pusher:member_removed", render);
    });

pusher.connection.bind("connected", onConnect);
