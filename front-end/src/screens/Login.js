import React from "react";
import Loading from "../components/Loading";

class Login extends React.Component {
  state = {
    loginDisabled: true,
    loading: false,
    userName: ""
  };

  handleInput = e => {
    this.setState({
      userName: e.target.value,
      loginDisabled: !e.target.value.length
    });
  };

  handleKeyPress = ({ key }) => key === "Enter" && this.handleLogin();

  handleLogin = () => {
    this.setState({ loading: true });
    this.props.onLogin(this.state.userName);
  };

  render() {
    const { loginDisabled } = this.state;

    return (
      <div className="container">
        <div
          className="jumbotron bg-light"
          style={{ width: "60%", margin: "auto", textAlign: "center" }}
        >
          <h1 className="display-3">Startup CliX</h1>
          <h3>
            A serverless multiplayer game created with{" "}
            <a href="https://pusher.com/channels">Pusher Channels</a> and{" "}
            <a href="https://github.com/awslabs/serverless-application-model">
              AWS SAM
            </a>!
          </h3>
          <p>A game will start when enough players have joined.</p>

          <div className="form-group">
            <label>Enter a Player Name</label>
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
            <button
              onClick={this.handleLogin}
              className="btn btn-outline-primary btn-lg btn-block"
              disabled={loginDisabled}
            >
              Join Game
            </button>
          )}
          <br />
          <h5 className="text-center">
            This game is a submission to{" "}
            <a href="https://dev.to/devteam/first-ever-dev-contest-build-a-realtime-app-with-pusher-4nhp">
              the first ever DEV contest
            </a>
          </h5>
        </div>
      </div>
    );
  }
}

export default Login;
