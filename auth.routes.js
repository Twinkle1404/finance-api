const { Router } = require('express');
const authService = require('../services/auth.service');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { successResponse } = require('../utils/helpers');

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), (req, res, next) => {
  try {
    const result = authService.register(req.body);
    successResponse(res, result, 201);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), (req, res, next) => {
  try {
    const result = authService.login(req.body);
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res, next) => {
  try {
    const profile = authService.getProfile(req.user.id);
    successResponse(res, { user: profile });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
