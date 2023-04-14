class ValidationError extends Error {
  name = "ValidationError";
  status = 400;
}

class UnauthorizedError extends Error {
  name = "UnauthorizedError";
  status = 401;
  message = "Unauthorized";
}

class ServerError extends Error {
  name = "ServerError";
  status = 500;
}

module.exports = {
  ValidationError,
  UnauthorizedError,
  ServerError,
};
