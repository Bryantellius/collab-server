const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { isValidId } = require("../../shared/db/db.utils");
const { sendEmail } = require("../../shared/emailer");
const UserModel = require("./user.model");
const RefreshTokenModel = require("../tokens/refreshToken.model");
const config = require("../../../config");

// TODO: jsDoc all

async function authenticate({ email, password, ipAddress }) {
  const userDTO = await UserModel.findOne({ email });

  if (
    !userDTO ||
    !userDTO.isVerified ||
    !bcrypt.compareSync(password, userDTO.passwordHash)
  ) {
    throw new Error("Email or password is incorrect");
  }

  // authentication successful so generate jwt and refresh tokens
  const jwtToken = generateJwtToken(userDTO);
  const refreshToken = generateRefreshToken(userDTO, ipAddress);

  // save refresh token
  await refreshToken.save();

  // return basic details and tokens
  return {
    ...basicDetails(userDTO),
    jwtToken,
    refreshToken: refreshToken.token,
  };
}

async function refreshToken({ token, ipAddress }) {
  const refreshTokenDTO = await getRefreshToken(token);
  const user = refreshTokenDTO.userId;

  // replace old refresh token with a new one and save
  const newRefreshTokenDTO = generateRefreshToken(user, ipAddress);
  refreshTokenDTO.revoked = Date.now();
  refreshTokenDTO.revokedByIp = ipAddress;
  refreshTokenDTO.replacedByToken = newRefreshTokenDTO.token;
  await refreshTokenDTO.save();
  await newRefreshTokenDTO.save();

  // generate new jwt
  const jwtToken = generateJwtToken(refreshTokenDTO);

  // return basic details and tokens
  return {
    ...basicDetails(user),
    jwtToken,
    refreshToken: newRefreshTokenDTO.token,
  };
}

async function revokeToken({ token, ipAddress }) {
  const refreshTokenDTO = await getRefreshToken(token);

  // revoke token and save
  refreshTokenDTO.revoked = Date.now();
  refreshTokenDTO.revokedByIp = ipAddress;
  await refreshTokenDTO.save();
}

async function register(newUserDetails, origin) {
  const userDTO = await UserModel.findOne({ email: newUserDetails.email });

  // validate
  if (userDTO) {
    // send already registered error in email to prevent account enumeration
    return await sendAlreadyRegisteredEmail(newUserDetails.email, origin);
  }

  // create account object
  const newUserDTO = new UserModel(newUserDetails);

  let userCount = await UserModel.countDocuments({});

  // first registered account is an admin
  const isFirstAccount = userCount === 0;
  newUserDTO.role = isFirstAccount
    ? config.constants.roles.ADMIN
    : config.constants.roles.USER;
  newUserDTO.verificationToken = randomTokenString();

  // hash password
  newUserDTO.passwordHash = hash(newUserDetails.password);

  // save account
  await newUserDTO.save();

  // send email
  await sendVerificationEmail(newUserDTO, origin);
}

async function verifyEmail({ token }) {
  const userDTO = await UserModel.findOne({ verificationToken: token });

  if (!userDTO) throw new Error("Email Verification failed");

  userDTO.verified = Date.now();
  userDTO.verificationToken = undefined;
  await userDTO.save();
}

async function forgotPassword({ email }, origin) {
  const userDTO = await UserModel.findOne({ email });

  // always return ok response to prevent email enumeration
  if (!userDTO) return;

  // create reset token that expires after 24 hours
  userDTO.resetToken = {
    token: randomTokenString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
  await userDTO.save();

  // send email
  await sendPasswordResetEmail(userDTO, origin);
}

async function validateResetToken({ token }) {
  const userDTO = await UserModel.findOne({
    "resetToken.token": token,
    "resetToken.expires": { $gt: Date.now() },
  });

  if (!userDTO) throw new Error("Invalid reset token");
}

async function resetPassword({ token, password }) {
  const userDTO = await UserModel.findOne({
    "resetToken.token": token,
    "resetToken.expires": { $gt: Date.now() },
  });

  if (!userDTO) throw new Error("Invalid reset token");

  // update password and remove reset token
  userDTO.passwordHash = hash(password);
  userDTO.passwordReset = Date.now();
  userDTO.resetToken = undefined;
  await userDTO.save();
}

async function getAll() {
  const users = await UserModel.find();
  return users.map((x) => basicDetails(x));
}

async function create(newUserDetails) {
  let userDTO = await UserModel.findOne({ email: newUserDetails.email });

  // validate
  if (userDTO) {
    throw new Error(
      'Email "' + newUserDetails.email + '" is already registered'
    );
  }

  const newUserDTO = new UserModel(newUserDetails);
  newUserDTO.verified = Date.now();

  // hash password
  newUserDTO.passwordHash = hash(newUserDetails.password);

  // save user
  await newUserDTO.save();

  return basicDetails(newUserDTO);
}

async function update(id, updateUserDetails) {
  const userDTO = await getUserById(id);
  const isExistingUser = await UserModel.findOne({
    email: updateUserDetails.email,
  });

  // validate (if email was changed)
  if (
    updateUserDetails.email &&
    userDTO.email !== updateUserDetails.email &&
    isExistingUser
  ) {
    throw new Error('Email "' + updateUserDetails.email + '" is already taken');
  }

  // hash password if it was entered
  if (updateUserDetails.password) {
    updateUserDetails.passwordHash = hash(updateUserDetails.password);
  }

  // copy updateUserDetails to account and save
  Object.assign(userDTO, updateUserDetails);
  userDTO.updated = Date.now();
  await userDTO.save();

  return basicDetails(userDTO);
}

async function remove(id) {
  const userDTO = await getUserById(id);
  await userDTO.deleteOne();
}

async function getUserById(id) {
  if (!isValidId(id)) throw new Error("Invalid user id");
  const userDTO = await UserModel.findById(id);
  if (!userDTO) throw new Error("User not found");
  return userDTO;
}

async function getRefreshToken(token) {
  const refreshToken = await RefreshTokenModel.findOne({ token }).populate(
    "userId"
  );
  if (!refreshToken || !refreshToken.isActive) throw new Error("Invalid token");
  return refreshToken;
}

function hash(password) {
  return bcrypt.hashSync(password, 10);
}

function generateJwtToken(user) {
  // create a jwt token containing the user id that expires in 15 minutes
  return jwt.sign({ sub: user.id, id: user.id }, config.secret, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user, ipAddress) {
  // create a refresh token that expires in 7 days
  return new RefreshTokenModel({
    userId: user.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}

function basicDetails(user) {
  const {
    id,
    title,
    firstName,
    lastName,
    email,
    role,
    created,
    updated,
    isVerified,
  } = user;

  return {
    id,
    title,
    firstName,
    lastName,
    email,
    role,
    created,
    updated,
    isVerified,
  };
}

async function sendVerificationEmail(user, origin) {
  let message;
  if (origin) {
    const verifyUrl = `${origin}/account/verify-email?token=${user.verificationToken}`;
    message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${user.verificationToken}</code></p>`;
  }

  await sendEmail({
    to: user.email,
    subject: "Sign-up Verification API - Verify Email",
    html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`,
  });
}

async function sendAlreadyRegisteredEmail(email, origin) {
  let message;
  if (origin) {
    message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
  } else {
    message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
  }

  await sendEmail({
    to: email,
    subject: "Sign-up Verification API - Email Already Registered",
    html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`,
  });
}

async function sendPasswordResetEmail(user, origin) {
  let message;
  if (origin) {
    const resetUrl = `${origin}/account/reset-password?token=${user.resetToken.token}`;
    message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${user.resetToken.token}</code></p>`;
  }

  await sendEmail({
    to: user.email,
    subject: "Sign-up Verification API - Reset Password",
    html: `<h4>Reset Password Email</h4>
               ${message}`,
  });
}

module.exports = {
  authenticate,
  refreshToken,
  revokeToken,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getAll,
  getUserById,
  create,
  update,
  remove,
};
