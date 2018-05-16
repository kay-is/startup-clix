import fetchJsonp from "fetch-jsonp";
import { API_URL } from "./constants";

let gameToken = null;

export default {
  getGameChannel: (socketId, userName, privateGame, maxPlayers = 4) =>
    fetchJsonp(
      `${API_URL}getgamechannel?socket_id=${socketId}&user_name=${userName}&private_game=${privateGame}&max_players=${maxPlayers}`
    )
      .then(r => r.json())
      .then(result => {
        gameToken = result.gameToken;
        delete result.gameToken;
        return result;
      }),

  joinPrivateGameChannel: (socketId, userName, privateGameId) =>
    fetchJsonp(
      `${API_URL}joinprivategamechannel?socket_id=${socketId}&user_name=${userName}&game_id=${privateGameId}`
    )
      .then(r => r.json())
      .then(result => {
        gameToken = result.gameToken;
        delete result.gameToken;
        return result;
      }),

  sellProduct: clicks =>
    fetchJsonp(
      `${API_URL}sellproduct?clicks=${clicks}&gameToken=${gameToken}`
    ).then(r => r.json())
};
