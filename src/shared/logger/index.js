const pino = require("pino");
const pinoHttp = require("pino-http");
const { randomUUID } = require("node:crypto");

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});
const httpLogger = pinoHttp({
  // Reuse an existing logger instance
  logger,

  // Define a custom request id function
  genReqId: function (req, res) {
    if (req.id) return req.id;
    let id = req.get("X-Request-Id");
    if (id) return id;
    id = randomUUID();
    res.header("X-Request-Id", id);
    return id;
  },
});

module.exports = {
  logger,
  httpLogger,
};
