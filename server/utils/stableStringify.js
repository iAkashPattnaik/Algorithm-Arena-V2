const stableValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const sortedKeys = Object.keys(value).sort();
    const normalized = {};
    for (const key of sortedKeys) {
      normalized[key] = stableValue(value[key]);
    }
    return normalized;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
};

const stableStringify = (value) => JSON.stringify(stableValue(value));

module.exports = { stableStringify };
