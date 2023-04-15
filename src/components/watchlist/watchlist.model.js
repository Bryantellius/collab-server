const { Schema, model } = require("../../shared/db");

const WatchlistItemSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  director: { type: String },
  genre: { type: String },
  rating: { type: Number },
  isWatched: { type: Boolean, required: true, default: false },
  dateAdded: { type: Date, required: true, default: Date.now },
  dateUpdated: { type: Date },
  dateWatched: { type: Date },
});

WatchlistItemSchema.set("toJSON", {
  virtuals: true,
  versionKey: true,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const WatchlistItemModel = model("WatchlistItem", WatchlistItemSchema);

module.exports = WatchlistItemModel;
