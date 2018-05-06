const API_URL = "https://bf6s24gp94.execute-api.us-east-1.amazonaws.com/Prod/";

const APP_KEY = "2205eeb25f71d1ef40fd";

console.log("getting a channel to join");

fetch(API_URL + "getgamechannel")
  .then(r => r.json())
  .then(channelId => {
    console.log("joining channel:" + channelId);
    const socket = new Pusher(APP_KEY, {
      authEndpoint: API_URL + "pusherauth"
    });

    const channel = socket.subscribe(channelId);

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
    channel.bind("pusher:member_added", render);
    channel.bind("pusher:member_removed", render);
  });
