const express = require("express");

const router = express.Router();

router.get("/hello", (req, res) => {
  try {
    res.send("world");
  } catch (e) {
    console.error(e);
    res.send("FAILED");
  }
});

module.exports = router;
