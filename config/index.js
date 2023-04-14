const dotenv = require("dotenv");

const envFound = dotenv.config();

if (!envFound) throw new Error("Failed to load env variables");

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT) || 5000,
  secret: process.env.SECRET,
  mongo: {
    uri: process.env.MONGODB_URI,
    db: process.env.MONGODB,
    collection: process.env.MONGODB_COLLECTION,
  },
  constants: {
    roles: {
      ADMIN: "Admin",
      USER: "User",
    },
    expirationDate: 7 * 24 * 60 * 60 * 1000,
  },
  email: {
    name: process.env.EMAIL_NAME,
    from: process.env.EMAIL_FROM,
    smtpOptions: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER_AUTH,
        pass: process.env.EMAIL_USER_PASSWORD,
      },
    },
  },
};
