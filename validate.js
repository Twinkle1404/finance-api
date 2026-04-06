const AppError = require('../utils/AppError');

/**
 * Validation middleware factory.
 * @param {import('joi').Schema} schema  – Joi schema
 * @param {'body'|'query'|'params'} source – which part of req to validate
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      return next(new AppError(`Validation error: ${messages}`, 400));
    }

    req[source] = value; // replace with sanitised values
    next();
  };
}

module.exports = validate;
