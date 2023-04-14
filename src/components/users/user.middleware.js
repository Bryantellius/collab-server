const { expressjwt } = require("express-jwt");

const config = require("../../../config");
const { validateSchema } = require("../../shared/db/db.utils");
const UserModel = require("./user.model");
const RefreshTokenModel = require("../tokens/refreshToken.model");
const Joi = require("joi");

// Middleware to check user login status
function authorize(roles = []) {
  // roles param can be a single role string (e.g. config.constants.roles.ADMIN or 'User')
  // or an array of roles (e.g. [config.constants.roles.ADMIN, config.constants.roles.ADMIN] or ['Admin', 'User'])
  if (typeof roles === "string") {
    roles = [roles];
  }

  return [
    // authenticate JWT token and attach user to request object (req.auth)
    expressjwt({ secret: config.secret, algorithms: ["HS256"] }),

    // authorize based on user role
    async function (req, res, next) {
      try {
        const userDTO = await UserModel.findById(req.auth.id);
        const refreshTokens = await RefreshTokenModel.find({
          userId: userDTO.id,
        });

        if (!userDTO || (roles.length && !roles.includes(userDTO.role))) {
          // user no longer exists or role not authorized
          return res.status(401).json({ message: "Unauthorized" });
        }

        // authentication and authorization successful
        req.auth.role = userDTO.role;
        req.auth.ownsToken = (token) =>
          Boolean(refreshTokens.find((x) => x.token === token));
        next();
      } catch (err) {
        next(err);
      }
    },
  ];
}

function validateAuthenticationSchema(req, res, next) {
  try {
    const schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    let validatedSchema = validateSchema(req.body, schema);
    req.body = validatedSchema;
    next();
  } catch (err) {
    next(err);
  }
}

function validateRevokeTokenSchema(req, res, next) {
  try {
    const schema = Joi.object({
      token: Joi.string().empty(""),
    });

    let validatedSchema = validateSchema(req.body, schema);
    req.body = validatedSchema;
    next();
  } catch (err) {
    next(err);
  }
}

function validateRegisterSchema(req, res, next) {
  try {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
      acceptTerms: Joi.boolean().valid(true).required(),
    });

    let validatedSchema = validateSchema(req.body, schema);
    req.body = validatedSchema;
    next();
  } catch (err) {
    next(err);
  }
}

function validateEmailVerificationSchema(req, res, next) {
  try {
    const schema = Joi.object({
      token: Joi.string().required(),
    });

    let validatedSchema = validateSchema(req.body, schema);
    req.body = validatedSchema;
    next();
  } catch (err) {
    next(err);
  }
}

function validateForgotPasswordSchema(req, res, next) {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    let validatedSchema = validateSchema(req.body, schema);
    req.body = validatedSchema;
    next();
  } catch (err) {
    next(err);
  }
}

function validateResetTokenSchema(req, res, next) {
  try {
    const schema = Joi.object({
      token: Joi.string().required(),
    });

    let validatedSchema = validateSchema(req.body, schema);
    req.body = validatedSchema;
    next();
  } catch (err) {
    next(err);
  }
}

function validateResetPasswordSchema(req, res, next) {
  try {
    const schema = Joi.object({
      token: Joi.string().required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    });

    let validatedSchema = validateSchema(req.body, schema);
    req.body = validatedSchema;
    next();
  } catch (err) {
    next(err);
  }
}

function validateCreateSchema(req, res, next) {
  try {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
      role: Joi.string().valid(config.constants.roles.ADMIN, config.constants.roles.USER).required(),
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
    const schemaRules = {
      firstName: Joi.string().empty(""),
      lastName: Joi.string().empty(""),
      email: Joi.string().email().empty(""),
      password: Joi.string().min(6).empty(""),
      confirmPassword: Joi.string().valid(Joi.ref("password")).empty(""),
    };

    // only admins can update role
    if (req.auth.role === config.constants.roles.ADMIN) {
      schemaRules.role = Joi.string()
        .valid(config.constants.roles.ADMIN, config.constants.roles.USER)
        .empty("");
    }

    const schema = Joi.object(schemaRules).with("password", "confirmPassword");

    let validatedSchema = validateSchema(req.body, schema);
    req.body = validatedSchema;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authorize,
  validateAuthenticationSchema,
  validateRevokeTokenSchema,
  validateRegisterSchema,
  validateEmailVerificationSchema,
  validateForgotPasswordSchema,
  validateResetTokenSchema,
  validateResetPasswordSchema,
  validateCreateSchema,
  validateUpdateSchema,
};
