const { Router } = require("express");

const TodoModel = require("./todo.model");
const { authorize } = require("../users/user.middleware");

const router = Router();

// protects all following routes with auth check
// router.use(authorize());

router.get("/", async (req, res, next) => {
  try {
    let { username } = req.user;

    let userTodosResult = await TodoModel.find({ username });

    res.customJson(userTodosResult);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    let { username } = req.user;

    let _id = req.params.id;

    let userTodoResult = await TodoModel.findOne({ _id, username });

    res.customJson(userTodoResult);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let { username } = req.user;
    let reminder = req.body.reminder;
    let completed = req.body.completed;

    let todoDTO = {
      username,
      reminder,
      completed,
    };

    let newTodoResult = await TodoModel.create(todoDTO);

    res.customJson(newTodoResult);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    let { username } = req.user;
    let _id = req.params.id;

    let reminder = req.body.reminder;
    let completed = req.body.completed;

    let todoDTO = {
      username,
      reminder,
      completed,
    };

    let updatedTodoResult = await TodoModel.updateOne(
      { username, _id },
      todoDTO,
      {
        new: true,
      }
    );

    res.customJson(updatedTodoResult);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let { username } = req.user;
    let _id = req.params.id;

    let deletedTodoResult = await TodoModel.remove({ _id, username });

    res.customJson(deletedTodoResult);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
