const { Router } = require("express");

const watchlistService = require("./watchlist.service");
const { authorize } = require("../users/user.middleware");
const {
  validateCreateSchema,
  validateUpdateSchema,
} = require("./watchlist.middleware");

const router = Router();

// protects all following routes with auth check
router.use(authorize());

router.get("/", async (req, res, next) => {
  try {
    let { id } = req.auth;

    let watchlistResult = await watchlistService.getAllByUserId(id);

    res.customJson(watchlistResult);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    let userId = req.auth.id;
    let id = req.params.id;

    let watchlistItemResult = await watchlistService.getOneByUserById(
      id,
      userId
    );

    res.customJson(watchlistItemResult);
  } catch (err) {
    next(err);
  }
});

router.post("/", validateCreateSchema, async (req, res, next) => {
  try {
    let userId = req.auth.id;
    req.body.userId = userId;

    let result = await watchlistService.create(req.body);
    res.customJson(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validateUpdateSchema, async (req, res, next) => {
  try {
    let userId = req.auth.id;
    req.body.userId = userId;
    let id = req.params.id;

    let result = await watchlistService.update(id, req.body);

    res.customJson(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let userId = req.auth.userId;
    let id = req.params.id;

    let result = await WatchlistModel.remove(id, userId);

    res.customJson(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
