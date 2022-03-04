const express = require("express");
const http = require("http");
const socket = require("socket.io");

const config = require("../config");
const { getLangExt } = require("./utils/code");

const app = express();

const server = http.createServer(app);

const io = socket(server);

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

app.post("/api/run", async (req, res) => {
  const { name, content, language } = req.body;
  console.log(req.body);
  let langExt = getLangExt(language);

  let result = await fetch(`${GLOT_URL}${language}/latest`, {
    method: "POST",
    headers: { Authorization: `Token ${GLOT_TOKEN}` },
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
