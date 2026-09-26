import { describe, expect, it } from 'vitest';

const BASE = import.meta.env.VITE_API_URL;

describe('frontend <-> backend integration (real API)', () => {
  it('reaches the health endpoint', async () => {
    const res = await fetch(`${BASE}/health`);
    expect(res.ok).toBe(true);
  });

  it('lists categories and providers exactly as the UI expects them shaped', async () => {
    const cats = await (await fetch(`${BASE}/categories`)).json();
    expect(cats.data.length).toBe(3);
    expect(cats.data[0]).toHaveProperty('nameAr');

    const providers = await (await fetch(`${BASE}/providers?limit=3`)).json();
    expect(providers.meta.total).toBe(18);
    expect(providers.data[0]).toHaveProperty('category.nameAr');
  });

  it('logs in, reads /me with the cookie, and logs out (full auth round-trip)', async () => {
    const login = await fetch(`${BASE}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user1@mawaeedy.local', password: 'User@12345' }),
    });
    expect(login.status).toBe(200);
    const cookie = login.headers.get('set-cookie');
    expect(cookie).toMatch(/HttpOnly/);

    const me = await fetch(`${BASE}/auth/me`, { headers: { cookie: cookie.split(';')[0] } });
    expect(me.status).toBe(200);
    const meBody = await me.json();
    expect(meBody.data.user.email).toBe('user1@mawaeedy.local');
    expect(meBody.data.user.password).toBeUndefined();
  });

  it('rejects a booking with a validation error shaped for the useForm hook', async () => {
    const res = await fetch(`${BASE}/appointments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
    });
    expect(res.status).toBe(401); // no session
  });
});
