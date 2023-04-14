const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const config = require("../config");
const routes = require("./routes");
const { httpLogger } = require("./shared/logger");
const swaggerRouter = require("./shared/swagger");
const errorHandler = require("./shared/errors/error.middleware");
const { normalizeResponseMiddleware } = require("./shared/utils");

const app = express();

const server = http.createServer(app);

// global middleware
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(normalizeResponseMiddleware);

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
app.use(errorHandler);

server.listen(config.port, async () => {
  console.log(`✅ Server running on port ${config.port}`);
});
