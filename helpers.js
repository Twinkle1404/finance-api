/**
 * Build a standardised success response envelope.
 */
function successResponse(res, data, statusCode = 200, meta = {}) {
  const response = { status: 'success', data };
  if (Object.keys(meta).length) response.meta = meta;
  return res.status(statusCode).json(response);
}

/**
 * Calculate pagination offset from page & limit.
 */
function paginate(page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  return { page: p, limit: l, offset: (p - 1) * l };
}

/**
 * Current ISO timestamp for SQLite.
 */
function now() {
  return new Date().toISOString();
}

module.exports = { successResponse, paginate, now };
