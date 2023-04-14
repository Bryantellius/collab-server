const { Schema, model } = require("mongoose");

const RefreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  token: String,
  expires: Date,
  created: { type: Date, default: Date.now },
  createdByIp: String,
  revoked: Date,
  revokedByIp: String,
  replacedByToken: String,
});

RefreshTokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expires;
});

RefreshTokenSchema.virtual("isActive").get(function () {
  return !this.revoked && !this.isExpired;
});

const RefreshTokenModel = model("RefreshToken", RefreshTokenSchema);

module.exports = RefreshTokenModel;
