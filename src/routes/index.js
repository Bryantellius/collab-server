const express = require("express");

const userRouter = require("../components/users/userController");
const todoRouter = require("../components/todos/todoController");

const router = express.Router();

router.get("/hello", (req, res) => {
  res.send("world");
});

router.use("/user/auth", userRouter);
router.use("/todos", todoRouter);

module.exports = router;
