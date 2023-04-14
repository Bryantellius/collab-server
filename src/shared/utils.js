function customJson(data, succeeded = true) {
  this.json({
    data,
    succeeded,
  });
}

function normalizeResponseMiddleware(req, res, next) {
  res.customJson = customJson;
  next();
}

module.exports = {
  normalizeResponseMiddleware,
};
