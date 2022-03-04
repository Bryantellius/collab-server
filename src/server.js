const express = require("express");
const http = require("http");
const fetch = require("isomorphic-fetch");
const cors = require("cors");
const helmet = require("helmet");

const { Server } = require("socket.io");

const config = require("../config");
const { getLangExt } = require("./utils/code");

const app = express();

const server = http.createServer(app);

const allowedOrigin =
  config.env == "development" ? "http://localhost:3000" : "https://collab-rnvfzhcqt-bryantellius.vercel.app";
const io = new Server(server, { cors: { origin: allowedOrigin } });

io.on("connection", (socket) => {
  console.log("socket established " + new Date().toString());

  socket.on("join-room", (data) => {
    console.log("User is joining...", data);
    const { roomId, user } = data;

    socket.join(roomId);

    socket.to(roomId).emit("new-user-connect", data);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", user);
    });

    socket.on("code-change", (code) => {
      socket.to(roomId).emit("update-code", code);
    });

    socket.on("run-code", (data) => {
      socket.to(roomId).emit("code-run", data);
    });

    socket.on("reset-code", () => {
      socket.to(roomId).emit("code-reset");
    });
  });
});

if (config.env == "development") {
  app.use(require("morgan")("dev"));
}

app.use(helmet());
app.use(cors());
app.use(express.json());

app.post("/api/code/run", async (req, res) => {
  const { name, content, language } = req.body;
  console.log(req.body);
  let langExt = getLangExt(language);

  let result = await fetch(`${config.glot.run_url}${language}/latest`, {
    method: "POST",
    headers: { Authorization: `Token ${config.glot.token}` },
    body: JSON.stringify({ files: [{ name: name + langExt, content }] }),
  });
  let data = await result.json();
  res.json(data);
});

app.use((req, res, next) => {
  try {
    res.send("Working");
  } catch (e) {
    console.error(e);
  }
});

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}...`);
});
