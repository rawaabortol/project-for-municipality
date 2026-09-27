/**
 * Creates an Error carrying an HTTP status code, for services to throw.
 */
export const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/**
 * Maps thrown errors to a consistent JSON response.
 * Mongoose validation / cast errors are client errors (400), duplicate keys are conflicts (409).
 */
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(", ")}`;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed JSON body";
  }

  if (status >= 500) console.error(err);
  return res.status(status).json({ success: false, message });
};

export const notFoundHandler = (req, res) =>
  res
    .status(404)
    .json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
