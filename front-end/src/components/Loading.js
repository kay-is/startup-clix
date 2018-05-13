import React from "react";

export default ({ text }) => (
  <div>
    <div className="progress" style={{ width: "90%", margin: "auto" }}>
      <div
        className="progress-bar progress-bar-striped progress-bar-animated"
        style={{ width: "100%" }}
      />
    </div>
    {!!text && <p style={{ textAlign: "center" }}>{text}</p>}
  </div>
);
