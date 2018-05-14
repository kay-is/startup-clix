import fetchJsonp from "fetch-jsonp";
import { API_URL } from "./constants";

let gameToken = null;

export default {
  getGameChannel: (socketId, userName) =>
    fetchJsonp(
      `${API_URL}getgamechannel?socket_id=${socketId}&user_name=${userName}`
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
