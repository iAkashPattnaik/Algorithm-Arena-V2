const crypto = require('crypto');

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'tokenHash',
  'authorization',
  'cookie',
]);

const valueHash = (input) => {
  return crypto.createHash('sha256').update(String(input || '')).digest('hex');
};

const sanitizeValue = (value, key = '') => {
  if (value === null || value === undefined) {
    return value;
  }

  if (SENSITIVE_KEYS.has(key)) {
    return '[REDACTED]';
  }

  if (key === 'code' && typeof value === 'string') {
    return {
      redacted: true,
      length: value.length,
      sha256: valueHash(value),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    const sanitized = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      sanitized[childKey] = sanitizeValue(childValue, childKey);
    }
    return sanitized;
  }

  return value;
};

module.exports = {
  sanitizeValue,
};
