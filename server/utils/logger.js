const serializeError = (error) => {
  if (!error) return undefined;
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
};

const log = (level, message, meta = {}) => {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
};

const logger = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, { ...meta, error: serializeError(meta?.error) }),
};

module.exports = { logger };

