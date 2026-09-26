export function getPagination(query, { defaultLimit = 10, maxLimit = 100 } = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function pageMeta(total, { page, limit }) {
  return { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
}

/** Escape user input before using it in a RegExp. */
export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
