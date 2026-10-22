delete process.env.PORT;
delete process.env.NODE_OPTIONS;
process.env.NODE_ENV = "development";

var fs = require("fs");
var path = require("path");
var marker = path.join(__dirname, "app", "next-error.txt");
try {
  fs.writeFileSync(marker, "start-dev.js ran " + new Date().toISOString() + " node=" + process.version + "\n");
} catch (e) {
  // ignore
}

process.argv = [
  process.execPath,
  path.join(__dirname, "node_modules", "next", "dist", "bin", "next"),
  "dev",
  ".",
  "-H",
  "0.0.0.0",
  "-p",
  "3000",
];

require("./node_modules/next/dist/bin/next");
