const { logger } = require("../logger");

function errorHandler(err, req, res, next) {
  logger.error({
    msg: `${err.name}: ${err.message}`,
    error: { name: err.name, msg: err.message, stack: err.stack },
  });

  res.status(err.status || 500).customJson(err.message, false);
}

module.exports = errorHandler;
