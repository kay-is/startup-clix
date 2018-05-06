const { readdirSync, statSync } = require("fs");
const { join, resolve } = require("path");
const { ncp } = require("ncp");

const sharedDir = resolve(__dirname + "/../shared/");
const functionsDir = resolve(__dirname + "/../functions/");

const dirs = p =>
  readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());

console.log("Copy shared code to Lambda Functions:");
dirs(functionsDir)
  .map(d => {
    console.log("  - " + d);
    return d;
  })
  .map(d => join(functionsDir, d, "shared"))
  .forEach(d => ncp(sharedDir, d));
