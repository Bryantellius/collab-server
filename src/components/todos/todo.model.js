const { Schema, model } = require("../../shared/db");

const TodoSchema = new Schema({
  userId: { type: String, required: true },
  reminder: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
});

TodoSchema.set("toJSON", {
  virtuals: true,
  versionKey: true,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const TodoModel = model("Todo", TodoSchema);

module.exports = TodoModel;
