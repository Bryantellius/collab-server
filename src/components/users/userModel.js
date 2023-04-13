const { Schema, model } = require("../../shared/db");

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
