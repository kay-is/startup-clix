import React from "react";
import gameApiClient from "../utils/gameApiClient";

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

    gameChannel.bind("debug", data => console.log(data));
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
    const { gameChannel } = this.props;
    const { players, gameStarted, gameEnded, sold } = this.state;
    const { me } = gameChannel.members;

    let content;

    if (gameEnded) content = <h2>Game ended!</h2>;
    else if (!gameStarted) content = <h2>Waiting for other players...</h2>;
    else
      content = (
        <div className="col-9">
          <div className="card" style={{ width: 400 }}>
            <h3 className="card-header">Create a Product</h3>
            <div className="card-body">
              <h5>
                The faster you click on the product, the better it gets, but
                don't forget to sell it when you're done!
              </h5>
            </div>
            <img
              style={{ display: "block" }}
              src="https://placeimg.com/300/200/tech"
              alt="product"
              onClick={this.handleProductClick}
            />

            <div className="card-body">
              <button
                disabled={sold}
                className="btn btn-success btn-lg btn-block"
                onClick={this.handleSale}
              >
                SHIP IT!
              </button>
            </div>
          </div>
        </div>
      );

    return (
      <div className="container">
        <div className="row">
          <div className="col-3">
            <h1>Startup CliX</h1>
            <PlayerList>
              {players.map(p => (
                <PlayerListItem name={p.info.name} capital={p.capital || 0} />
              ))}
            </PlayerList>
          </div>
          {content}
        </div>
      </div>
    );
  }
}

const PlayerList = ({ children }) => <ul className="list-group">{children}</ul>;

const PlayerListItem = ({ name, capital, me }) => {
  let classes =
    "list-group-item d-flex justify-content-between align-items-center";

  if (me) classes += " active";

  return (
    <li className={classes}>
      <img
        className={me ? "bg-light" : "bg-primary"}
        style={{ borderRadius: "50%" }}
        src={`http://robohash.org/${name}.jpg?set=set3&size=50x50`}
        alt={"Avatar of player " + name}
      />
      <h5 style={{ flex: 2 }}>&nbsp;{name}</h5>
      <span className="badge badge-success badge-pill">${capital}</span>
    </li>
  );
};

export default Game;
