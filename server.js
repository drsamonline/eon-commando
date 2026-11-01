#!/usr/bin/env node
/* Eon Commando — LAN host.
 *
 * Serves the game on the local network and gives it a room, so two people on
 * the same Wi-Fi can play co-op with no internet and no accounts.
 *
 *   node server.js            # port 8080, room on 8081
 *   node server.js 9000       # port 9000, room on 9001
 *
 * Built on lan-kit (SSE + POST, zero dependencies).
 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { createHost } = require("./server/lan-host.js");

const PORT = Number(process.argv[2] || 8080);
const ROOM_PORT = PORT + 1;
const ROOT = __dirname;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json"
};

const web = http.createServer(function (req, res) {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, path.normalize(p).replace(/^(\.\.[/\\])+/, ""));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end("no"); return; }
  fs.readFile(file, function (err, buf) {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
});

const room = createHost({ room: "eon", history: 0 });
room.onMessage(function (m) {
  if (m && m.t === "report") console.log("REPORT " + JSON.stringify(m));
});

function lanAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const n of nets[name] || []) {
      if (n.family === "IPv4" && !n.internal) return n.address;
    }
  }
  return "localhost";
}

(async function () {
  const roomPort = await room.listen(ROOM_PORT);
  web.listen(PORT, function () {
    const ip = lanAddress();
    console.log("");
    console.log("  EON COMMANDO — LAN");
    console.log("  ------------------");
    console.log("  Open on both machines:  http://" + ip + ":" + PORT + "/?lanport=" + roomPort);
    console.log("  Room channel on port " + roomPort);
    console.log("  Player 1 presses H to host, player 2 presses J to join.");
    console.log("");
  });
})();
