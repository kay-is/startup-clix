import React from "react";
import gameApiClient from "../utils/gameApiClient";
import QrCode from "qrcode.react";

class Game extends React.Component {
  state = {
    gameStarted: false,
    gameEnded: false,
    players: [],
    sold: true
  };

  roundStart = Date.now();
  clicks = 0;

  componentDidMount() {
    const { gameChannel } = this.props;

    this.initPlayers();

    gameChannel.bind("pusher:member_added", this.handlePlayerJoined);
    gameChannel.bind("pusher:member_removed", this.handlePlayerLeft);

    gameChannel.bind("game:start", this.handleGameStart);
    gameChannel.bind("round:start", this.handleRoundStart);
    gameChannel.bind("round:end", this.handleRoundEnd);
    gameChannel.bind("game:end", this.handleGameEnd);
  }

  handleGameStart = data =>
    this.setState(state => ({
      gameStarted: true,
      players: state.players.map(p => {
        p.capital = data.capital;
        return p;
      })
    }));

  handleRoundStart = data => this.setState({ sold: false });

  handleRoundEnd = update => {
    this.clicks = 0;
    this.setState(({ players }) => ({
      sold: true,
      players: players
        .filter(p => {
          if (update.players[p.id]) return !update.players[p.id].lost;
          return false;
        })
        .map(p => {
          if (update.players[p.id]) p.capital = update.players[p.id].capital;
          return p;
        })
    }));
  };

  handleGameEnd = () => this.setState({ gameEnded: true });

  handlePlayerJoined = player =>
    this.setState(state => ({
      players: [...state.players, player]
    }));

  handlePlayerLeft = ({ id }) =>
    this.setState(state => ({
      players: state.players.filter(p => p.id !== id)
    }));

  initPlayers = () => {
    const players = [];

    this.props.gameChannel.members.each(m => {
      players.push(m);
    });

    this.setState({ players });
  };

  handleProductClick = () => {
    this.clicks = this.clicks + 1;
  };

  handleSale = async () => {
    this.saleTime = Date.now();
    this.setState({ sold: true });
    await gameApiClient.sellProduct(this.clicks);
    this.clicks = 0;
  };

  render() {
    const { gameChannel, privateGame } = this.props;
    const { players, gameStarted, gameEnded, sold } = this.state;

    let content;

    if (gameEnded) content = <h2>Game ended!</h2>;
    else if (!gameStarted) {
      content = (
        <div
          className="jumbotron bg-light text-center"
          style={{ margin: "auto" }}
        >
          <h1>Startup CliX</h1>
          <h4>Waiting for players...</h4>
          {privateGame && (
            <div>
              <h4>Share the link with your friends!</h4>
              <input
                className="form-control"
                readOnly
                style={{ width: "100%" }}
                value={window.location.href + "#" + gameChannel.name}
              />
              <br />
              <QrCode
                value={window.location.href + "#" + gameChannel.name}
                size={225}
              />
            </div>
          )}
        </div>
      );
    } else
      content = (
        <div className="card">
          <h3 className="card-header">Create a Product</h3>
          <div className="card-body">
            <h5>
              The faster you click on the product, the better it gets, but don't
              forget to sell it when you're done!
            </h5>
          </div>
          {sold ? (
            <h2 className="text-center">Wait for the next round!</h2>
          ) : (
            [
              <button onClick={this.handleProductClick}>
                <h2>PRODUCT</h2>
                <img
                  style={{ width: "100%" }}
                  src="https://placeimg.com/300/200/tech"
                  alt="product"
                />
              </button>,

              <div className="card-body">
                <button
                  className="btn btn-success btn-lg btn-block"
                  onClick={this.handleSale}
                >
                  SHIP IT!
                </button>
              </div>
            ]
          )}
        </div>
      );

    return (
      <div className="container" style={{ maxWidth: 500 }}>
        <a href=".">
          <h4 className="d-inline">Leave Game</h4>
        </a>
        &nbsp;
        {players.map(p => (
          <span
            class="badge badge-light"
            style={{ marginRight: 5, marginBottom: 5 }}
          >
            🕹{p.info.name + " "}
            <span class="badge badge-pill badge-success">${p.capital}</span>
          </span>
        ))}
        {content}
      </div>
    );
  }
}

export default Game;
