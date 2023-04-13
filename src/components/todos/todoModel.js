const { Schema, model } = require("../../shared/db");

const TodoSchema = new Schema({
  username: { type: String, required: true },
  reminder: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
});

const TodoModel = model("Todo", TodoSchema);

module.exports = TodoModel;
