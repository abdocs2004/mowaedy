/**
 * Removes any key starting with "$" or containing "." from request bodies, so user input can
 * never be interpreted as a MongoDB operator (NoSQL-injection defence in depth; zod schemas
 * also only accept plain typed values).
 */
function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$') || k.includes('.')) continue;
      out[k] = clean(v);
    }
    return out;
  }
  return value;
}

export const sanitizeBody = (req, _res, next) => {
  if (req.body) req.body = clean(req.body);
  next();
};
