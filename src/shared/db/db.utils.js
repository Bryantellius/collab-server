const mongoose = require("mongoose");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validateSchema(payload, schema) {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };
  const { error, value } = schema.validate(payload, options);

  if (error)
    throw new Error(
      "Validation error: " + error.details.map((x) => x.message).join(", ")
    );

  return value;
}

module.exports = {
  isValidId,
  validateSchema,
};
