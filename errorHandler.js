const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // SQLite constraint errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    err = new AppError('A record with that value already exists.', 409);
  }
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    err = new AppError('Referenced resource does not exist.', 400);
  }

  const response = {
    status: err.status,
    message: err.message,
  };

  // In development, include the stack trace
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  console.error(`[ERROR] ${err.statusCode} – ${err.message}`);
  res.status(err.statusCode).json(response);
}

module.exports = errorHandler;
