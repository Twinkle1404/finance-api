const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { queryOne } = require('../config/database');

/**
 * Middleware: verify JWT token and attach user to req.
 */
function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB to check status
    const user = queryOne('SELECT id, name, email, role, status FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }
    if (user.status !== 'active') {
      throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    if (err.name === 'JsonWebTokenError') return next(new AppError('Invalid token.', 401));
    if (err.name === 'TokenExpiredError') return next(new AppError('Token has expired. Please log in again.', 401));
    next(err);
  }
}

module.exports = auth;
