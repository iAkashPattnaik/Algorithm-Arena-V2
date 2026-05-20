const { sendValidationError } = require('../utils/response');

const normalizeZodErrors = (issues) => {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'unknown',
    message: issue.message,
  }));
};

const validate = (schemas) => (req, res, next) => {
  const targets = ['body', 'query', 'params'];
  const errors = [];

  targets.forEach((target) => {
    if (!schemas[target]) return;
    const result = schemas[target].safeParse(req[target]);
    if (!result.success) {
      errors.push(...normalizeZodErrors(result.error.issues));
      return;
    }
    req[target] = result.data;
  });

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  return next();
};

module.exports = { validate };

