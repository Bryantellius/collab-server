const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const { MongoClient } = require("mongodb");
const { Server } = require("socket.io");
const config = require("../config");
const routes = require("./routes");

const app = express();

console.log(config.mongo.uri)

const client = new MongoClient(config.mongo.uri);

const server = http.createServer(app);

const allowedOrigin =
  config.env == "development" ? "http://localhost:3000" : "*";
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

    socket.on("code-change", async (code) => {
      let result = await client
        .db(config.mongo.db)
        .collection(config.mongo.collection)
        .updateOne({ roomId }, { $set: { code } });

      console.log(result);

      socket.to(roomId).emit("update-code", code);
    });

    socket.on("run-code", (data) => {
      socket.to(roomId).emit("run-code", data);
    });
  });
});

if (config.env == "development") {
  app.use(require("morgan")("dev"));
}

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.client = client;
  next();
});
app.use("/api", routes);

// Default Display for any request not matching /api...
app.use((req, res, next) => {
  try {
    res.send("Send a request to /api/* to get a response");
  } catch (e) {
    console.error(e);
  }
});

server.listen(config.port, async () => {
  console.log(`✅ Server running on port ${config.port}`);

  try {
    await client.connect();
    console.log(`✅ Connected to mongodb`);
  } catch (e) {
    console.error(e);
  }
});
