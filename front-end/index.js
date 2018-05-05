const APP_KEY = "2205eeb25f71d1ef40fd";

const socket = new Pusher(APP_KEY);

const channel = socket.subscribe("global");

console.log("App started");
channel.bind("hello", event => console.log(event));
