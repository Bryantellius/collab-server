const mongoose = require("mongoose");

const config = require("../../../config");
const { logger } = require("../logger");

mongoose.connect(config.mongo.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection
  .on("open", () => {
    logger.info("DB: Connection Open");
  })
  .on("close", () => {
    logger.warn("DB: Connection Closing");
  })
  .on("error", (err) => {
    logger.error("DB: " + err.message);
  });

module.exports = mongoose;
