const BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status = 0, code = 'ERROR', errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors; // { field: "Arabic message" } for validation errors
  }
}

const SESSION_CODES = new Set(['TOKEN_EXPIRED', 'TOKEN_INVALID']);

function buildUrl(path, params) {
  const url = new URL(BASE + path, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

async function request(method, path, { body, params, signal } = {}) {
  let res;
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      credentials: 'include',
      signal,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('تعذر الاتصال بالخادم، تحقق من اتصالك بالإنترنت وحاول مرة أخرى', 0, 'NETWORK');
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    const err = new ApiError(payload?.message || 'حدث خطأ غير متوقع', res.status, payload?.code || 'ERROR', payload?.errors);
    if (res.status === 401 && SESSION_CODES.has(err.code)) window.dispatchEvent(new CustomEvent('auth:expired', { detail: err }));
    if (res.status === 403 && err.code === 'ACCOUNT_DISABLED') window.dispatchEvent(new CustomEvent('auth:expired', { detail: err }));
    throw err;
  }
  return payload ?? {};
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body: body ?? {} }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body: body ?? {} }),
  delete: (path, opts) => request('DELETE', path, opts),
};
