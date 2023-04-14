const { Router } = require("express");

const config = require("../../../config");
const userService = require("./user.services");
const {
  validateAuthenticationSchema,
  authorize,
  validateRevokeTokenSchema,
  validateRegisterSchema,
  validateEmailVerificationSchema,
  validateForgotPasswordSchema,
  validateResetTokenSchema,
  validateResetPasswordSchema,
  validateCreateSchema,
  validateUpdateSchema,
} = require("./user.middleware");

const router = Router();

router.post(
  "/authenticate",
  validateAuthenticationSchema,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;

      let result = await userService.authenticate({
        email,
        password,
        ipAddress,
      });

      setTokenCookie(res, result.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post("/refresh-token", async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    const result = await userService.refreshToken({ token, ipAddress });
    setTokenCookie(res, result.refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/revoke-token",
  authorize(),
  validateRevokeTokenSchema,
  async (req, res, next) => {
    try {
      const token = req.body.token || req.cookies.refreshToken;
      const ipAddress = req.ip;

      if (!token) throw new Error("Token is required");

      if (
        !req.auth.ownsToken(token) &&
        req.auth.role !== config.constants.roles.ADMIN
      )
        throw new Error("Unauthorized");

      await userService.revokeToken({ token, ipAddress });
      res.json({ message: "Token revoked" });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/register", validateRegisterSchema, async (req, res, next) => {
  try {
    await userService.register(req.body, req.get("origin"));
    res.json({
      message:
        "Registration successful, please check your email for verification instructions",
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/verify-email",
  validateEmailVerificationSchema,
  async (req, res, next) => {
    try {
      await userService.verifyEmail(req.body);
      res.json({ message: "Verification successful. Proceed to login." });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/forgot-password",
  validateForgotPasswordSchema,
  async (req, res, next) => {
    try {
      await userService.forgotPassword(req.body, req.get("origin"));
      res.json({
        message: "Please check your email for password reset instructions",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/validate-reset-token",
  validateResetTokenSchema,
  async (req, res, next) => {
    try {
      await userService.validateResetToken(req.body);
      res.json({ message: "Token is valid" });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/reset-password",
  validateResetPasswordSchema,
  async (req, res, next) => {
    try {
      await userService.resetPassword(req.body);
      res.json({ message: "Password reset successfully. Proceed to login." });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/",
  authorize(config.constants.roles.ADMIN),
  async (req, res, next) => {
    try {
      let result = await userService.getAll();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:id", authorize(), async (req, res, next) => {
  try {
    const id = req.params.id;

    // users can get their own account and admins can get any account
    if (id !== req.auth.id && req.auth.role !== config.constants.roles.ADMIN) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let result = await userService.getUserById(id);

    if (!result) res.status(404).json({});
    else res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authorize(config.constants.roles.ADMIN),
  validateCreateSchema,
  async (req, res, next) => {
    try {
      let result = await userService.create(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  authorize(),
  validateUpdateSchema,
  async (req, res, next) => {
    try {
      const id = req.params.id;

      if (
        id !== req.auth.id &&
        req.auth.role !== config.constants.roles.ADMIN
      ) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let result = await userService.update(id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", authorize(), async (req, res, next) => {
  try {
    const id = req.params.id;

    if (id !== req.auth.id && req.auth.role !== config.constants.roles.ADMIN) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await userService.remove(id);
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    next(err);
  }
});

function setTokenCookie(res, token) {
  // create cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + config.constants.expirationDate),
  };
  res.cookie("refreshToken", token, cookieOptions);
}

module.exports = router;
