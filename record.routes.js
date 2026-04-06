const { Router } = require('express');
const recordService = require('../services/record.service');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createRecordSchema, updateRecordSchema, recordQuerySchema } = require('../validators/record.validator');
const { successResponse } = require('../utils/helpers');

const router = Router();

// All record routes require authentication
router.use(auth);

// POST /api/records  —  Admin only
router.post('/', rbac('admin'), validate(createRecordSchema), (req, res, next) => {
  try {
    const record = recordService.create(req.body, req.user.id);
    successResponse(res, { record }, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/records  —  Viewer+
router.get('/', rbac('viewer', 'analyst', 'admin'), validate(recordQuerySchema, 'query'), (req, res, next) => {
  try {
    const { records, meta } = recordService.list(req.query);
    successResponse(res, { records }, 200, meta);
  } catch (err) {
    next(err);
  }
});

// GET /api/records/:id  —  Viewer+
router.get('/:id', rbac('viewer', 'analyst', 'admin'), (req, res, next) => {
  try {
    const record = recordService.getById(parseInt(req.params.id, 10));
    successResponse(res, { record });
  } catch (err) {
    next(err);
  }
});

// PUT /api/records/:id  —  Admin only
router.put('/:id', rbac('admin'), validate(updateRecordSchema), (req, res, next) => {
  try {
    const record = recordService.update(parseInt(req.params.id, 10), req.body);
    successResponse(res, { record });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/records/:id  —  Admin only (soft delete)
router.delete('/:id', rbac('admin'), (req, res, next) => {
  try {
    recordService.softDelete(parseInt(req.params.id, 10));
    successResponse(res, null, 204);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
