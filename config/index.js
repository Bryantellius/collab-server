const dotenv = require("dotenv");

const envFound = dotenv.config();

if (!envFound) throw new Error("Failed to load env variables");

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT) || 5000,
  glot: {
    run_url: process.env.GLOT_RUN_URL,
    token: process.env.GLOT_TOKEN,
  },
  mongo: {
    uri: process.env.MONGODB_URI,
    db: process.env.MONGODB,
    collection: process.env.MONGODB_COLLECTION,
  },
};
