const { Router } = require("express");

const TodoModel = require("./todo.model");
const { authorize } = require("../users/user.middleware");

const router = Router();

// protects all following routes with auth check
// router.use(authorize());

/**
 * @openapi
 * /todos:
 *   get:
 *     summary: Retrieve a list of todo items for a given user
 *     description: Returns a list of todo items
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.get("/", async (req, res, next) => {
  try {
    let { username } = req.user;

    let userTodosResult = await TodoModel.find({ username });

    res.json(userTodosResult);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /todos/{id}:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.get("/:id", async (req, res, next) => {
  try {
    let { username } = req.user;

    let _id = req.params.id;

    let userTodoResult = await TodoModel.findOne({ _id, username });

    res.json(userTodoResult);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * TODO
 */
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

    res.json(newTodoResult);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * TODO
 */
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

    res.json(updatedTodoResult);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * TODO
 */
router.delete("/:id", async (req, res, next) => {
  try {
    let { username } = req.user;
    let _id = req.params.id;

    let deletedTodoResult = await TodoModel.remove({ _id, username });

    res.json(deletedTodoResult);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
