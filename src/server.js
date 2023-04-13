const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const config = require("../config");
const routes = require("./routes");

const app = express();

const server = http.createServer(app);

if (config.env == "development") {
  app.use(require("morgan")("dev"));
}

app.use(helmet());
app.use(cors());
app.use(express.json());

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
});
