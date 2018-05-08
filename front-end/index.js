const API_URL = "https://bf6s24gp94.execute-api.us-east-1.amazonaws.com/Prod/";

const APP_KEY = "2205eeb25f71d1ef40fd";

console.log("getting a channel to join");

fetchJsonp(API_URL + "getgamechannel")
  .then(r => r.json())
  .then(response => {
    console.log(JSON.stringify(response.channels, null, "  "));
    const socket = new Pusher(APP_KEY, {
      authTransport: "jsonp",
      authEndpoint: API_URL + "pusherauth"
    });

    console.log("Joining channel:", response.channelId);

    const channel = socket.subscribe(response.channelId);

    channel.bind("hello", event => {
      document.getElementById("serverevent").innerHTML = JSON.stringify(
        event,
        null,
        " "
      );
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
