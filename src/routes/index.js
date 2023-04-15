const express = require("express");

const userRouter = require("../components/users/user.controller");
const todoRouter = require("../components/todos/todo.controller");
const watchlistRouter = require("../components/watchlist/watchlist.controller");

const router = express.Router();

router.get("/hello", (req, res) => {
  res.send("world");
});

router.use("/users", userRouter);
// router.use("/todos", todoRouter);
router.use("/watchlist", watchlistRouter);

module.exports = router;
