const { Schema, model } = require("../../shared/db");

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  acceptTerms: Boolean,
  role: { type: String, required: true },
  verificationToken: String,
  verified: Date,
  resetToken: {
    token: String,
    expires: Date,
  },
  passwordReset: Date,
  created: { type: Date, default: Date.now },
  updated: Date,
});

UserSchema.virtual("isVerified").get(function () {
  return Boolean(this.verified) || Boolean(this.passwordReset);
});

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.passwordHash;
  },
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
