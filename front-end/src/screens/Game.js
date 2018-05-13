import React from "react";

class Game extends React.Component {
  state = {
    players: [],
    price: 0
  };

  roundStart = Date.now();
  clicks = 0;

  componentDidMount() {
    const { gameChannel } = this.props;

    gameChannel.bind("pusher:member_added", this.handleNewPlayer);
    gameChannel.bind("pusher:member_removed", this.handleNewPlayer);

    this.interval = setInterval(() => {
      this.setState({
        price: parseInt(1000000 * this.clicks / (Date.now() - this.roundStart))
      });
    }, 100);

    this.updatePlayers();
  }

  handleNewPlayer = () => {
    this.updatePlayers();
  };

  updatePlayers = () => {
    const players = [];
    this.props.gameChannel.members.each(m => players.push(m));
    console.log(players);
    this.setState({ players });
  };

  handleProductClick = () => {
    this.clicks = this.clicks + 1;
  };

  handleSale = () => {
    alert(
      "[TODO] Send data to server\n\nYou sold your product for: $" +
        this.state.price +
        "\n Game ended."
    );
    clearInterval(this.interval);
    window.location.reload();
  };

  render() {
    const { gameChannel } = this.props;
    const { clicks, players, price } = this.state;
    const { me } = gameChannel.members;

    return (
      <div className="container">
        <div className="row">
          <div className="col-3">
            <h1>Startup CliX</h1>
            <PlayerList>
              <PlayerListItem name={me.info.name} money={30000} me />
              {players
                .filter(p => me.id != p.id)
                .map(p => <PlayerListItem name={p.info.name} money={30000} />)}
            </PlayerList>
          </div>
          <div className="col-9">
            <div className="card" style={{ width: 400 }}>
              <h3 className="card-header">Product worth: ${price}</h3>
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
                  className="btn btn-success btn-lg btn-block"
                  onClick={this.handleSale}
                >
                  SELL!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const PlayerList = ({ children }) => <ul className="list-group">{children}</ul>;

const PlayerListItem = ({ name, money, me }) => {
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
      <span className="badge badge-success badge-pill">${money}</span>
    </li>
  );
};

export default Game;
