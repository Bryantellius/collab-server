const jwt = require("jsonwebtoken");

const config = require("../../../config");

// Middleware to check user login status
const isLoggedIn = async (req, res, next) => {
  try {
    let authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      if (token) {
        const payload = await jwt.verify(token, config.secret);

        if (payload) {
          req.user = payload;
          next();
        } else {
          throw new Error("Invalid token");
        }
      } else {
        throw new Error("Invalid authorization header");
      }
    } else {
      throw new Error("No authorization header");
    }
  } catch (err) {
    err.status = 400;
    next(err);
  }
};

module.exports = {
  isLoggedIn,
};
