const Joi = require('joi');

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('viewer', 'analyst', 'admin').required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required(),
});

module.exports = { updateRoleSchema, updateStatusSchema };
