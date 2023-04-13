const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../../../config");
const UserModel = require("./userModel");

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    let username = req.body.username;
    let hashedPassword = await bcrypt.hash(req.body.password, 10);

    // TODO: more validation
    if (username.length == 0 || hashedPassword.length == 0)
      throw new Error("Username or password is invalid");

    const newUserResult = await UserModel.create({
      username,
      password: hashedPassword,
    });

    let token = await jwt.sign(
      { username: newUserResult.username },
      config.secret
    );

    res.json({ ...newUserResult, token });
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    let username = req.body.username;
    let attemptedPassword = req.body.password;

    // TODO: more validation
    if (username.length == 0 || attemptedPassword.length == 0)
      throw new Error("Username and password must not be blank");

    let foundUserResult = await UserModel.findOne({ username });

    if (foundUserResult) {
      let comparedPassword = await bcrypt.compare(
        attemptedPassword,
        foundUserResult.password
      );

      if (comparedPassword) {
        let token = await jwt.sign(
          { username: foundUserResult.username },
          config.secret
        );
        res.json({ ...foundUserResult, token });
      } else {
        throw new Error("Invalid Password");
      }
    } else {
      throw new Error("Invalid Username");
    }
  } catch (err) {
    err.status = 401;
    next(err);
  }
});

module.exports = router;
