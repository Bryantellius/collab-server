const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const config = require("../config");
const routes = require("./routes");
const { logger, httpLogger } = require("./shared/logger");
const swaggerRouter = require("./shared/swagger");

const app = express();

const server = http.createServer(app);

// global middleware
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// pino-http logger
app.use(httpLogger);

// routes
app.use("/api/v1", routes);
app.use("/", swaggerRouter);

// Default Display for any request not matching /api...
app.use((req, res, next) => {
  try {
    res.status(404).send("Nothin's here yo");
  } catch (e) {
    next(e);
  }
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  logger.error({
    msg: err.message,
    error: { msg: err.message, stack: err.stack },
  });
  // TODO: maturize
  res.status(err.status || 500).json({ msg: err.message, succeeded: false });
});

server.listen(config.port, async () => {
  console.log(`✅ Server running on port ${config.port}`);
});
