import React from "react";
import Loading from "../components/Loading";

class Login extends React.Component {
  state = {
    loginDisabled: true,
    loading: false,
    userName: "",
    playerCount: undefined
  };

  handlePrivateCheckbox = e => this.setState({ privateGame: e.target.checked });

  handleInput = e =>
    this.setState({
      userName: e.target.value,
      loginDisabled: !e.target.value.length
    });

  handleKeyPress = ({ key }) => key === "Enter" && this.handleLogin(false)();

  handlePlayerCount = e => {
    let playerCount = parseInt(e.target.value);
    if (playerCount > 10) playerCount = 10;
    this.setState({ playerCount });
  };

  handleLogin = privateGame => () => {
    this.setState({ loading: true });

    const { userName, playerCount } = this.state;
    this.props.onLogin(userName, privateGame, playerCount);
  };

  render() {
    const { loginDisabled } = this.state;

    const privateGameId = window.location.hash.substring(1);

    return (
      <div className="container">
        <div
          className="jumbotron bg-light"
          style={{ maxWidth: 500, margin: "auto", textAlign: "center" }}
        >
          <h1 className="display-5">Startup CliX</h1>
          <h3>
            A game created with<br />
            <a href="https://pusher.com/channels">Pusher Channels</a>
            <br /> and{" "}
            <a href="https://github.com/awslabs/serverless-application-model">
              AWS SAM
            </a>
          </h3>

          <div className="form-group">
            <label>Enter a player name!</label>
            <input
              className="form-control"
              autoFocus={true}
              onInput={this.handleInput}
              onKeyPress={this.handleKeyPress}
            />
          </div>

          {this.state.loading ? (
            <Loading text="Joining game..." />
          ) : (
            <div>
              <button
                onClick={this.handleLogin(false)}
                className="btn btn-success btn-lg btn-block"
                disabled={loginDisabled}
              >
                {!!privateGameId ? "Join Game of a Friend" : "Join Public Game"}
              </button>
              <br />
              {!privateGameId && (
                <div className="d-flex">
                  <button
                    style={{ flex: 3 }}
                    onClick={this.handleLogin(true)}
                    className="btn btn-info btn-lg btn-block"
                    disabled={loginDisabled}
                  >
                    Start Private Game
                  </button>
                  <input
                    type="number"
                    style={{ flex: 1 }}
                    className="form-control"
                    placeholder="4 Players"
                    value={this.state.playerCount}
                    onChange={this.handlePlayerCount}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <br />
        <h5 className="text-center">
          This game is a submission to<br />
          <a href="https://dev.to/devteam/first-ever-dev-contest-build-a-realtime-app-with-pusher-4nhp">
            the first ever DEV contest
          </a>
        </h5>
      </div>
    );
  }
}

export default Login;
