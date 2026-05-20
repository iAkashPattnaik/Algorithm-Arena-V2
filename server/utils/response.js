const sendSuccess = (res, { statusCode = 200, data = null, message, meta } = {}) => {
  const payload = { success: true, data };
  if (message) payload.message = message;
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendValidationError,
};

