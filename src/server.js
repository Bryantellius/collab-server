const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");

const config = require("../config");
const routes = require("./routes");
const { logger, httpLogger } = require("./shared/logger");

const app = express();

const server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.use("/api/v1", routes);

// Default Display for any request not matching /api...
app.use((req, res, next) => {
  try {
    res.send("Send a request to /api/* to get a response");
  } catch (e) {
    next(e);
  }
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  logger.error({ msg: err.message, error: err });
  // TODO: maturize
  res.status(err.status || 500).json({ ...err });
});

server.listen(config.port, async () => {
  console.log(`✅ Server running on port ${config.port}`);
});
