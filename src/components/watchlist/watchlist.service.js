const WatchlistItemModel = require("./watchlist.model");
const config = require("../../../config");
const { isValidId } = require("../../shared/db/db.utils");

async function getAll() {
  const watchListItems = await WatchlistItemModel.find();
  return watchListItems;
}

async function getOneById(id) {
  const watchListItems = await WatchlistItemModel.findOne({ id });
  return watchListItems;
}

async function getAllByUserId(userId) {
  const watchListItems = await WatchlistItemModel.find({ userId });
  return watchListItems;
}

async function getOneByUserById(id, userId) {
  const watchListItems = await WatchlistItemModel.findOne({ id, userId });
  return watchListItems;
}

async function create(itemDetails) {
  const newItemDTO = new WatchlistItemModel(itemDetails);

  // save item
  await newItemDTO.save();

  return newItemDTO;
}

async function update(id, itemDetails) {
  const itemDTO = await getOneByUserById(id, itemDetails.userId);

  if (!itemDTO) {
    throw new Error("Watchlist item does not exist");
  }

  if (itemDetails.isWatched) {
    itemDetails.dateWatched = Date.now();
  }

  // copy itemDetails to item and save
  Object.assign(itemDTO, itemDetails);
  itemDTO.dateUpdated = Date.now();
  await itemDTO.save();

  return itemDTO;
}

async function remove(id, userId) {
  const itemDTO = await getOneByUserById(id, userId);
  await itemDTO.deleteOne();
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
