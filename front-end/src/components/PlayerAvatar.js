import React from "react";

export default ({ userName }) => (
  <img
    alt={"Avatar of player " + userName}
    src={`https://robohash.org/${userName}.png?size=100x100`}
    style={{ borderRadius: 50, borderWidth: 2, borderColor: "black" }}
  />
);
