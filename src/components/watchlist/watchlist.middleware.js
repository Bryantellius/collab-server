const { validateSchema } = require("../../shared/db/db.utils");
const Joi = require("joi");

function validateCreateSchema(req, res, next) {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      director: Joi.string().required().empty(""),
      genre: Joi.string().required().empty(""),
      rating: Joi.number().min(0).max(5),
      isWatched: Joi.boolean(),
    });

    let validatedSchema = validateSchema(req.body, schema);
    req.body = validatedSchema;
    next();
  } catch (err) {
    next(err);
  }
}

function validateUpdateSchema(req, res, next) {
  try {
    const schema = Joi.object({
      title: Joi.string().empty(""),
      director: Joi.string().empty(""),
      genre: Joi.string().empty(""),
      rating: Joi.number().min(0).max(5),
      isWatched: Joi.boolean(),
    });

    let validatedSchema = validateSchema(req.body, schema);
    req.body = validatedSchema;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateCreateSchema,
  validateUpdateSchema,
};
