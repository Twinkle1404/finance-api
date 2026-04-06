const { Router } = require('express');
const dashboardService = require('../services/dashboard.service');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { dashboardQuerySchema, recentActivityQuerySchema } = require('../validators/dashboard.validator');
const { successResponse } = require('../utils/helpers');

const router = Router();

// All dashboard routes require authentication
router.use(auth);

// GET /api/dashboard/summary  —  Analyst+
// Query: ?from=2026-01-01&to=2026-03-31&type=income&category=Salary&user_id=1
router.get('/summary', rbac('analyst', 'admin'), validate(dashboardQuerySchema, 'query'), (req, res, next) => {
  try {
    const summary = dashboardService.getSummary(req.query);
    successResponse(res, { summary });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/category-breakdown  —  Analyst+
// Query: ?from=2026-01-01&to=2026-03-31&type=expense&user_id=1
router.get('/category-breakdown', rbac('analyst', 'admin'), validate(dashboardQuerySchema, 'query'), (req, res, next) => {
  try {
    const breakdown = dashboardService.getCategoryBreakdown(req.query);
    successResponse(res, { breakdown });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/monthly-trends  —  Analyst+
// Query: ?from=2026-01-01&to=2026-06-30&type=expense&category=Rent
router.get('/monthly-trends', rbac('analyst', 'admin'), validate(dashboardQuerySchema, 'query'), (req, res, next) => {
  try {
    const trends = dashboardService.getMonthlyTrends(req.query);
    successResponse(res, { trends });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/recent-activity  —  Viewer+
// Query: ?from=2026-02-01&to=2026-02-28&type=income&limit=5
router.get('/recent-activity', rbac('viewer', 'analyst', 'admin'), validate(recentActivityQuerySchema, 'query'), (req, res, next) => {
  try {
    const { limit, ...filters } = req.query;
    const records = dashboardService.getRecentActivity(filters, limit);
    successResponse(res, { records });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
