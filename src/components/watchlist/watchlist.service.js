const WatchlistItemModel = require("./watchlist.model");
const config = require("../../../config");
const { isValidId } = require("../../shared/db/db.utils");
const { ValidationError } = require("../../shared/errors");

async function getAll() {
  const watchListItems = await WatchlistItemModel.find();
  return watchListItems.map((item) => basicDetails(item));
}

async function getOneById(id) {
  const watchListItem = await WatchlistItemModel.findOne({ _id: id });
  return basicDetails(watchListItem);
}

async function getAllByUserId(userId) {
  const watchListItems = await WatchlistItemModel.find({ userId });
  return watchListItems.map((item) => basicDetails(item));
}

async function getOneByUserById(id, userId) {
  const watchListItem = await WatchlistItemModel.findOne({ _id: id, userId });
  return basicDetails(watchListItem);
}

async function create(itemDetails) {
  const newItemDTO = new WatchlistItemModel(itemDetails);

  // save item
  await newItemDTO.save();

  return basicDetails(newItemDTO);
}

async function update(id, itemDetails) {
  const itemDTO = await WatchlistItemModel.findOne({
    _id: id,
    userId: itemDetails.userId,
  });

  if (!itemDTO) {
    throw new ValidationError("Watchlist item does not exist");
  }

  if (itemDetails.isWatched) {
    itemDetails.dateWatched = Date.now();
  }

  // copy itemDetails to item and save
  Object.assign(itemDTO, itemDetails);
  itemDTO.dateUpdated = Date.now();
  await itemDTO.save();

  return basicDetails(itemDTO);
}

async function remove(id, userId) {
  const itemDTO = await WatchlistItemModel.findOne({ _id: id, userId });
  if (!itemDTO) throw new ValidationError("Watchlist item does not exist");
  await itemDTO.deleteOne();
}

function basicDetails(watchListItem) {
  const {
    id,
    title,
    director,
    genre,
    rating,
    isWatched,
    dateAdded,
    dateUpdated,
    dateWatched,
    userId,
  } = watchListItem;

  return {
    id,
    title,
    director,
    genre,
    rating,
    isWatched,
    dateAdded,
    dateUpdated,
    dateWatched,
    userId,
  };
}

module.exports = {
  getAll,
  getAllByUserId,
  getOneById,
  getOneByUserById,
  create,
  update,
  remove,
};
