const Joi = require('joi');

const createRecordSchema = Joi.object({
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().trim().min(1).max(100).required(),
  amount: Joi.number().positive().precision(2).required(),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({ 'string.pattern.base': 'date must be in YYYY-MM-DD format' }),
  description: Joi.string().trim().max(500).allow('', null),
});

const updateRecordSchema = Joi.object({
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim().min(1).max(100),
  amount: Joi.number().positive().precision(2),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({ 'string.pattern.base': 'date must be in YYYY-MM-DD format' }),
  description: Joi.string().trim().max(500).allow('', null),
}).min(1); // at least one field required

const recordQuerySchema = Joi.object({
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim(),
  from: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  to: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('date', 'amount', 'category', 'created_at').default('date'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = { createRecordSchema, updateRecordSchema, recordQuerySchema };
