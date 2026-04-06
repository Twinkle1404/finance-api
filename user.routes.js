const { Router } = require('express');
const userService = require('../services/user.service');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { updateRoleSchema, updateStatusSchema } = require('../validators/user.validator');
const { successResponse } = require('../utils/helpers');

const router = Router();

// All user routes require auth + admin role
router.use(auth, rbac('admin'));

// GET /api/users
router.get('/', (req, res, next) => {
  try {
    const { users, meta } = userService.list(req.query);
    successResponse(res, { users }, 200, meta);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', (req, res, next) => {
  try {
    const user = userService.getById(parseInt(req.params.id, 10));
    successResponse(res, { user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/role
router.patch('/:id/role', validate(updateRoleSchema), (req, res, next) => {
  try {
    const user = userService.updateRole(parseInt(req.params.id, 10), req.body.role);
    successResponse(res, { user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/status
router.patch('/:id/status', validate(updateStatusSchema), (req, res, next) => {
  try {
    const user = userService.updateStatus(parseInt(req.params.id, 10), req.body.status);
    successResponse(res, { user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id
router.delete('/:id', (req, res, next) => {
  try {
    userService.delete(parseInt(req.params.id, 10));
    successResponse(res, null, 204);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
