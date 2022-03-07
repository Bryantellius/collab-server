const express = require("express");
const config = require("../../config");
const fetch = require("isomorphic-fetch");
const {
  getLangExt,
  checkLanguage,
  getDefaultCode,
  getAbbr,
} = require("../utils/code");
const id_16 = require("id-16");

const id_generator = id_16.generator(6);

const router = express.Router();

router.post("/code/run", async (req, res) => {
  try {
    const { name, content, language } = req.body;
    console.log(req.body);
    let langExt = getLangExt(language);

    let result = await fetch(`${config.glot.run_url}${language}/latest`, {
      method: "POST",
      headers: { Authorization: `Token ${config.glot.token}` },
      body: JSON.stringify({ files: [{ name: name + langExt, content }] }),
    });
    let data = await result.json();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.json({ msg: "Failed to run code", error: e.message });
  }
});

router.get("/room/join", async (req, res) => {
  try {
    let results = await res.client
      .db(config.mongo.db)
      .collection(config.mongo.collection)
      .findOne({ roomId: req.query.roomId });
    console.log(results);

    if (!results) {
      throw new Error(`No room exists with the id: ${req.query.roomId}`);
    }

    res.json({
      msg: "Successfully found room to join.",
      roomId: results?.roomId,
    });
  } catch (e) {
    console.error(e);
    res.json({
      msg: "We failed to find the room you're looking to join. Try another room id.",
      error: e.message,
    });
  }
});

router.get("/room/info", async (req, res) => {
  try {
    let results = await res.client
      .db(config.mongo.db)
      .collection(config.mongo.collection)
      .findOne({ roomId: req.query.roomId });
    console.log(results);

    if (!results) {
      throw new Error(`No room exists with the id: ${req.query.roomId}`);
    }

    res.json({
      info: results,
      msg: "Successfully loaded data for " + req.query.roomId,
      success: true,
    });
  } catch (e) {
    console.error(e);
    res.json({
      msg: "We failed to find the info to the room you're looking to join. Try again later.",
      error: e.message,
    });
  }
});

router.post("/room/create", async (req, res) => {
  try {
    let { language } = req.query;

    if (!language || !checkLanguage(language)) {
      throw new Error("You failed to supply a valid programming language.");
    }

    let roomId = getAbbr(language) + "-" + id_generator();

    let results = await res.client
      .db(config.mongo.db)
      .collection(config.mongo.collection)
      .insertOne({
        roomId,
        language,
        code: getDefaultCode(language),
      });
    console.log(results);
    res.json({
      data: results,
      roomId,
      success: true,
      msg: "Successfully created room",
    });
  } catch (e) {
    console.error(e);
    res.json({
      msg: "We failed to create the room a room for you. Try another again later.",
      error: e.message,
    });
  }
});

module.exports = router;
