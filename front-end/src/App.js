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
    screen: "login"
  };

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
  handleLogin = async userName => {
    const gameId = await this.pusher.getGameChannelId(userName);

    this.gameChannel = this.pusher.subscribe(gameId);
    this.gameChannel.bind("pusher:subscription_succeeded", () =>
      this.setState({ screen: "game", userName })
    );
  };

  render() {
    const { connected, limitReached, screen, userName } = this.state;

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
      return <GameScreen gameChannel={this.gameChannel} userName={userName} />;
  }
}

export default App;
