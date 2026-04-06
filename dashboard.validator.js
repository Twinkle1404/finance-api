const Joi = require('joi');

/**
 * Shared query schema for all dashboard endpoints.
 * Accepts: from, to, type, category, user_id
 */
const dashboardQuerySchema = Joi.object({
  from: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({ 'string.pattern.base': 'from must be in YYYY-MM-DD format' }),
  to: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({ 'string.pattern.base': 'to must be in YYYY-MM-DD format' }),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim().max(100),
  user_id: Joi.number().integer().positive(),
});

/**
 * Recent-activity specific: adds a limit param.
 */
const recentActivityQuerySchema = dashboardQuerySchema.keys({
  limit: Joi.number().integer().min(1).max(50).default(10),
});

module.exports = { dashboardQuerySchema, recentActivityQuerySchema };
