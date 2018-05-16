import React, { Component } from "react";

import LoginScreen from "./screens/Login";
import GameScreen from "./screens/Game";

import Loading from "./components/Loading";
import initPusher from "./utils/pusher";

class App extends Component {
  state = {
    gameId: null,
    connected: false,
    limitReached: false,
    screen: "login",
    privateGame: false
  };

  privateGameId = window.location.hash.substring(1);

  pusher: null;
  componentDidMount() {
    this.pusher = initPusher();
    this.pusher.connection.bind("connected", () =>
      this.setState({ connected: true })
    );
    this.pusher.connection.bind("error", ({ error }) => {
      if (error.data.code === 4004) this.setState({ limitReached: true });
    });
  }

  gameChannel = null;
  handleLogin = async (userName, privateGame, playerCount) => {
    let gameId;

    // if we have this.privateGameId, it came from the URL hash
    // join an existing private game

    // if the privateGame arugment is true, the current client
    // join a new private game

    if (!!this.privateGameId) {
      gameId = await this.pusher.joinPrivateGameChannel(
        userName,
        this.privateGameId
      );
      privateGame = true;
    } else {
      gameId = await this.pusher.getGameChannelId(
        userName,
        privateGame,
        playerCount
      );
    }

    this.gameChannel = this.pusher.subscribe(gameId);
    this.gameChannel.bind("pusher:subscription_succeeded", () =>
      this.setState({ screen: "game", userName, privateGame })
    );
  };

  render() {
    const {
      connected,
      limitReached,
      privateGame,
      screen,
      userName
    } = this.state;

    if (limitReached)
      return (
        <div style={{ textAlign: "center" }}>
          <h1>:(</h1>
          <h3>
            Sorry, there are too many players at the moment.<br /> Please try
            again later.
          </h3>
        </div>
      );

    if (!connected) return <Loading text="Connecting to Pusher..." />;

    if (screen === "login") return <LoginScreen onLogin={this.handleLogin} />;

    if (screen === "game")
      return (
        <GameScreen
          gameChannel={this.gameChannel}
          userName={userName}
          privateGame={privateGame}
        />
      );
  }
}

export default App;
