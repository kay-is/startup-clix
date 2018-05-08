const { readdirSync, statSync } = require("fs");
const { join, resolve } = require("path");
const { execSync } = require("child_process");

const functionsDir = resolve(__dirname + "/../functions/");

const dirs = p =>
  readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());

console.log("Running 'npm i' for Lambda functions:");
dirs(functionsDir)
  .map(d => {
    console.log("  - " + d);
    return d;
  })
  .map(d => join(functionsDir, d))
  .forEach(d => execSync(`cd ${d} && npm i`));
