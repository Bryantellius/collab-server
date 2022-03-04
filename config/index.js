const dotenv = require("dotenv");

const envFound = dotenv.config();

if (!envFound) throw new Error("Failed to load env variables");

module.exports = {
    env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT) || 5000,
};
