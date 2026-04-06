const AppError = require('../utils/AppError');

/**
 * Role-based access control middleware factory.
 * Usage: rbac('admin', 'analyst')  →  only those roles may proceed.
 */
function rbac(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
          403
        )
      );
    }
    next();
  };
}

module.exports = rbac;
