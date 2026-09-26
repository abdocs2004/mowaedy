import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
const baseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mawaeedy';
process.env.MONGODB_URI = baseUri.replace(/\/([^/?]+)(\?|$)/, '/$1_test$2');
process.env.JWT_SECRET ||= 'test-secret-test-secret-test-secret-123';

const { default: request } = await import('supertest');
const mongoose = (await import('mongoose')).default;
const { createApp } = await import('../src/app.js');
const { connectDB, disconnectDB } = await import('../src/config/db.js');
const { seed } = await import('../src/seed/seed.js');
const { Appointment, SlotLock } = await import('../src/models/index.js');
const { addDaysStr, todayStr } = await import('../src/utils/time.js');

const app = createApp();
const api = () => request(app);

async function login(email, password) {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ email, password });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  return { agent, token: res.body.data.token, user: res.body.data.user };
}

/** Finds a provider/service/date with free slots. */
async function findBookable(slug = 'barber', providerIndex = 0) {
  const list = await api().get(`/api/providers?category=${slug}&sort=name&limit=50`);
  const provider = list.body.data[providerIndex];
  const detail = await api().get(`/api/providers/${provider._id}`);
  const service = detail.body.data.services[0];
  for (let i = 3; i < 25; i += 1) {
    const date = addDaysStr(todayStr(), i);
    const res = await api().get(`/api/providers/${provider._id}/slots?serviceId=${service._id}&date=${date}`);
    if (res.body.data.slots.length >= 4) return { provider, service, date, slots: res.body.data.slots };
  }
  throw new Error('no free slots found');
}

before(async () => {
  await connectDB();
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  await seed({ reset: true });
});
after(async () => {
  await mongoose.connection.dropDatabase();
  await disconnectDB();
});

describe('public API', () => {
  it('lists categories and providers with filters', async () => {
    const cats = await api().get('/api/categories');
    assert.equal(cats.body.data.length, 3);
    const all = await api().get('/api/providers?limit=50');
    assert.equal(all.body.meta.total, 18);
    const gyms = await api().get('/api/providers?category=gym');
    assert.equal(gyms.body.meta.total, 6);
    const search = await api().get('/api/providers?q=' + encodeURIComponent('رامي'));
    assert.equal(search.body.meta.total, 2);
    const byService = await api().get('/api/providers?service=' + encodeURIComponent('كشف'));
    assert.equal(byService.body.meta.total, 6);
    const empty = await api().get('/api/providers?q=zzzzzz');
    assert.equal(empty.body.data.length, 0);
  });

  it('rejects operator injection in query strings', async () => {
    const res = await api().get('/api/providers?q[$ne]=x');
    assert.equal(res.status, 400);
  });
});

describe('authentication', () => {
  it('validates registration input with Arabic messages', async () => {
    const res = await api().post('/api/auth/register').send({ name: 'س', email: 'bad', phone: '12', password: '123' });
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
    assert.ok(res.body.errors.email.includes('البريد'));
    assert.ok(res.body.errors.password);
  });

  it('registers, blocks duplicates, and never returns the password hash', async () => {
    const body = { name: 'مستخدم جديد', email: 'New@Example.com', phone: '01099998888', password: 'Passw0rd!' };
    const ok = await api().post('/api/auth/register').send(body);
    assert.equal(ok.status, 201);
    assert.equal(ok.body.data.user.role, 'user');
    assert.equal(ok.body.data.user.email, 'new@example.com');
    assert.equal(ok.body.data.user.password, undefined);
    const dup = await api().post('/api/auth/register').send(body);
    assert.equal(dup.status, 409);
  });

  it('cannot self-register as admin', async () => {
    const res = await api().post('/api/auth/register').send({ name: 'Hacker', email: 'h@x.com', phone: '01099998877', password: 'Passw0rd!', role: 'admin' });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.user.role, 'user');
  });

  it('rejects wrong credentials with the same message for unknown emails', async () => {
    const a = await api().post('/api/auth/login').send({ email: 'user1@mawaeedy.local', password: 'wrong-pass1' });
    const b = await api().post('/api/auth/login').send({ email: 'nobody@mawaeedy.local', password: 'wrong-pass1' });
    assert.equal(a.status, 401);
    assert.equal(a.body.message, b.body.message);
  });

  it('protects /me, sets an httpOnly cookie and supports logout', async () => {
    assert.equal((await api().get('/api/auth/me')).status, 401);
    const agent = request.agent(app);
    const res = await agent.post('/api/auth/login').send({ email: 'user1@mawaeedy.local', password: 'User@12345' });
    assert.match(res.headers['set-cookie'][0], /HttpOnly/);
    assert.equal((await agent.get('/api/auth/me')).status, 200);
    await agent.post('/api/auth/logout');
    assert.equal((await agent.get('/api/auth/me')).status, 401);
  });

  it('rejects malformed tokens', async () => {
    const res = await api().get('/api/auth/me').set('Authorization', 'Bearer not.a.token');
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'TOKEN_INVALID');
  });

  it('invalidates old tokens after a password change', async () => {
    const { token } = await login('user8@mawaeedy.local', 'User@12345');
    const change = await api().patch('/api/auth/password').set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'User@12345', newPassword: 'NewPass123' });
    assert.equal(change.status, 200);
    assert.equal((await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`)).status, 401);
    assert.equal((await api().get('/api/auth/me').set('Authorization', `Bearer ${change.body.data.token}`)).status, 200);
  });
});

describe('booking', () => {
  it('books a slot, prevents double-booking, and frees the slot on cancel', async () => {
    const { provider, service, slots } = await findBookable('barber', 0);
    const u1 = await login('user1@mawaeedy.local', 'User@12345');
    const u2 = await login('user2@mawaeedy.local', 'User@12345');
    const payload = { providerId: provider._id, serviceId: service._id, startAt: slots[1].start };

    const first = await u1.agent.post('/api/appointments').send(payload);
    assert.equal(first.status, 201, JSON.stringify(first.body));
    assert.ok(['pending', 'confirmed'].includes(first.body.data.status));

    const clash = await u2.agent.post('/api/appointments').send(payload);
    assert.equal(clash.status, 409);
    assert.equal(clash.body.code, 'SLOT_TAKEN');

    const after = await api().get(`/api/providers/${provider._id}/slots?serviceId=${service._id}&date=${slots[1].start.slice(0, 10)}`);
    assert.ok(!after.body.data.slots.some((s) => s.start === slots[1].start));

    const cancel = await u1.agent.patch(`/api/appointments/${first.body.data._id}/cancel`).send({});
    assert.equal(cancel.status, 200);
    assert.equal(cancel.body.data.status, 'cancelled');

    const again = await u2.agent.post('/api/appointments').send(payload);
    assert.equal(again.status, 201);
  });

  it('lets only one of many concurrent requests win the same slot', async () => {
    const { provider, service, slots } = await findBookable('gym', 1);
    const users = await Promise.all(['user3', 'user4', 'user5', 'user6'].map((u) => login(`${u}@mawaeedy.local`, 'User@12345')));
    const payload = { providerId: provider._id, serviceId: service._id, startAt: slots[0].start };
    const results = await Promise.all(users.map((u) => u.agent.post('/api/appointments').send(payload)));
    const wins = results.filter((r) => r.status === 201).length;
    assert.equal(wins, 1, results.map((r) => r.status).join(','));
    assert.equal(await Appointment.countDocuments({ provider: provider._id, startAt: new Date(slots[0].start), status: { $in: ['pending', 'confirmed'] } }), 1);
  });

  it('has a database-level guard: the same slot key can never be inserted twice', async () => {
    const key = 'provider-x:1700000000000';
    await SlotLock.create({ key, appointment: new mongoose.Types.ObjectId() });
    await assert.rejects(SlotLock.create({ key, appointment: new mongoose.Types.ObjectId() }), (e) => e.code === 11000);
    await SlotLock.deleteOne({ key });
  });

  it('a long service blocks every slot cell it covers', async () => {
    const list = await api().get('/api/providers?category=barber&sort=name&limit=50');
    const provider = list.body.data[3];
    const detail = await api().get(`/api/providers/${provider._id}`);
    const long = detail.body.data.services.find((s) => s.durationMinutes === 60);
    const short = detail.body.data.services.find((s) => s.durationMinutes === 30);
    let date; let slots;
    for (let i = 5; i < 25; i += 1) {
      date = addDaysStr(todayStr(), i);
      slots = (await api().get(`/api/providers/${provider._id}/slots?serviceId=${short._id}&date=${date}`)).body.data.slots;
      if (slots.length >= 6) break;
    }
    const { agent } = await login('user4@mawaeedy.local', 'User@12345');
    // 60-minute booking at slots[2] must also block the following 30-minute cell.
    const res = await agent.post('/api/appointments').send({ providerId: provider._id, serviceId: long._id, startAt: slots[2].start });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    const next = new Date(new Date(slots[2].start).getTime() + 30 * 60000).toISOString();
    const { agent: other } = await login('user6@mawaeedy.local', 'User@12345');
    const clash = await other.post('/api/appointments').send({ providerId: provider._id, serviceId: short._id, startAt: next });
    assert.equal(clash.status, 409);
    await agent.patch(`/api/appointments/${res.body.data._id}/cancel`).send({});
    const free = await other.post('/api/appointments').send({ providerId: provider._id, serviceId: short._id, startAt: next });
    assert.equal(free.status, 201);
  });

  it('rejects invalid slots, past dates and unknown services', async () => {
    const { provider, service, slots } = await findBookable('clinic', 0);
    const { agent } = await login('user7@mawaeedy.local', 'User@12345');
    const off = new Date(new Date(slots[0].start).getTime() + 7 * 60 * 1000).toISOString();
    assert.equal((await agent.post('/api/appointments').send({ providerId: provider._id, serviceId: service._id, startAt: off })).body.code, 'INVALID_SLOT');
    const past = new Date(Date.now() - 86400000).toISOString();
    assert.equal((await agent.post('/api/appointments').send({ providerId: provider._id, serviceId: service._id, startAt: past })).status, 400);
    assert.equal((await agent.post('/api/appointments').send({ providerId: provider._id, serviceId: '64b000000000000000000000', startAt: slots[0].start })).status, 404);
    assert.equal((await agent.post('/api/appointments').send({ providerId: provider._id, startAt: 'nonsense' })).status, 400);
    assert.equal((await api().post('/api/appointments').send({})).status, 401);
  });

  it("does not let a user read or cancel someone else's appointment", async () => {
    const mine = await login('user1@mawaeedy.local', 'User@12345');
    const other = await login('user2@mawaeedy.local', 'User@12345');
    const list = await mine.agent.get('/api/appointments/mine?scope=upcoming');
    assert.ok(list.body.data.length > 0);
    const id = list.body.data[0]._id;
    assert.equal((await other.agent.get(`/api/appointments/${id}`)).status, 404);
    assert.equal((await other.agent.patch(`/api/appointments/${id}/cancel`).send({})).status, 404);
  });

  it('enforces the cancellation window for customers', async () => {
    const appt = await Appointment.findOne({ status: { $in: ['pending', 'confirmed'] }, startAt: { $gt: new Date() } }).populate('user');
    await Appointment.updateOne({ _id: appt._id }, { startAt: new Date(Date.now() + 30 * 60000), endAt: new Date(Date.now() + 60 * 60000) });
    const pw = appt.user.email.startsWith('user8') ? 'NewPass123' : 'User@12345';
    const { agent } = await login(appt.user.email, pw);
    const res = await agent.patch(`/api/appointments/${appt._id}/cancel`).send({});
    assert.equal(res.status, 400);
  });
});

describe('roles and dashboards', () => {
  it('blocks users and providers from admin routes, allows admin', async () => {
    const user = await login('user1@mawaeedy.local', 'User@12345');
    const prov = await login('provider01@mawaeedy.local', 'Provider@12345');
    const admin = await login('admin@mawaeedy.local', 'Admin@12345');
    assert.equal((await user.agent.get('/api/admin/stats')).status, 403);
    assert.equal((await prov.agent.get('/api/admin/users')).status, 403);
    assert.equal((await api().get('/api/admin/stats')).status, 401);
    const stats = await admin.agent.get('/api/admin/stats');
    assert.equal(stats.status, 200);
    assert.equal(stats.body.data.totals.providers, 18);
    assert.equal(stats.body.data.series.length, 30);
    assert.equal((await user.agent.get('/api/provider/me')).status, 403);
  });

  it('provider manages own appointments only and follows the status flow', async () => {
    const prov = await login('provider01@mawaeedy.local', 'Provider@12345');
    const me = await prov.agent.get('/api/provider/me');
    assert.equal(me.status, 200);
    const list = await prov.agent.get('/api/provider/appointments?status=pending&limit=50');
    const pending = list.body.data.find((a) => new Date(a.startAt) > new Date());
    if (pending) {
      const ok = await prov.agent.patch(`/api/provider/appointments/${pending._id}/status`).send({ status: 'confirmed' });
      assert.equal(ok.status, 200);
      const early = await prov.agent.patch(`/api/provider/appointments/${pending._id}/status`).send({ status: 'completed' });
      assert.equal(early.status, 400); // not yet started
      const back = await prov.agent.patch(`/api/provider/appointments/${pending._id}/status`).send({ status: 'pending' });
      assert.equal(back.status, 400); // invalid transition
    }
    const foreign = await Appointment.findOne({ provider: { $ne: me.body.data._id } });
    assert.equal((await prov.agent.patch(`/api/provider/appointments/${foreign._id}/status`).send({ status: 'cancelled' })).status, 404);
  });

  it('provider edits services and working hours with validation', async () => {
    const prov = await login('provider02@mawaeedy.local', 'Provider@12345');
    const created = await prov.agent.post('/api/provider/services').send({ name: 'خدمة جديدة', price: 90, durationMinutes: 30 });
    assert.equal(created.status, 201);
    assert.equal((await prov.agent.post('/api/provider/services').send({ name: 'x', price: -5, durationMinutes: 30 })).status, 400);
    assert.equal((await prov.agent.post('/api/provider/services').send({ name: 'مدة غريبة', price: 50, durationMinutes: 45 })).status, 400);
    const hours = await prov.agent.patch('/api/provider/me').send({ workingHours: [{ day: 0, isOpen: true, start: '18:00', end: '09:00', breaks: [] }] });
    assert.equal(hours.status, 400);
    const del = await prov.agent.delete(`/api/provider/services/${created.body.data._id}`);
    assert.equal(del.status, 200);
  });

  it('admin CRUD: create provider, protect last admin, block deleting users with appointments', async () => {
    const admin = await login('admin@mawaeedy.local', 'Admin@12345');
    const cats = await api().get('/api/categories');
    const gym = cats.body.data.find((c) => c.slug === 'gym');
    const created = await admin.agent.post('/api/admin/providers').send({
      owner: { name: 'مالك جديد', email: 'owner@new.com', password: 'Passw0rd!' },
      category: gym._id, name: 'كابتن جديد', city: 'القاهرة', address: 'شارع 1',
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.data.workingHours.length, 7);
    const pLogin = await login('owner@new.com', 'Passw0rd!');
    assert.equal(pLogin.user.provider.name, 'كابتن جديد');

    const users = await admin.agent.get('/api/admin/users?role=user&limit=50');
    const withAppts = await Appointment.findOne({}).select('user');
    assert.equal((await admin.agent.delete(`/api/admin/users/${withAppts.user}`)).status, 409);
    const adminUser = (await admin.agent.get('/api/admin/users?role=admin')).body.data[0];
    assert.equal((await admin.agent.patch(`/api/admin/users/${adminUser._id}`).send({ isActive: false })).status, 400);
    assert.ok(users.body.meta.total >= 8);

    const upd = await admin.agent.patch(`/api/admin/providers/${created.body.data._id}`).send({ isActive: false });
    assert.equal(upd.body.data.isActive, false);
    const hidden = await api().get(`/api/providers/${created.body.data._id}`);
    assert.equal(hidden.status, 404);
    assert.equal((await admin.agent.delete(`/api/admin/providers/${created.body.data._id}`)).status, 200);
  });

  it('disabled users cannot log in or use existing sessions', async () => {
    const admin = await login('admin@mawaeedy.local', 'Admin@12345');
    const victim = await login('user5@mawaeedy.local', 'User@12345');
    await admin.agent.patch(`/api/admin/users/${victim.user._id}`).send({ isActive: false });
    assert.equal((await victim.agent.get('/api/auth/me')).status, 403);
    assert.equal((await api().post('/api/auth/login').send({ email: 'user5@mawaeedy.local', password: 'User@12345' })).status, 403);
  });
});

describe('contact form', () => {
  it('stores messages, validates input, and only admins can read them', async () => {
    assert.equal((await api().post('/api/contact').send({ name: 'x', email: 'bad', message: 'hi' })).status, 400);
    const ok = await api().post('/api/contact').send({ name: 'زائر', email: 'v@x.com', subject: 'سؤال', message: 'مرحباً، عندي سؤال بسيط' });
    assert.equal(ok.status, 201);
    assert.equal((await api().get('/api/admin/messages')).status, 401);
    const admin = await login('admin@mawaeedy.local', 'Admin@12345');
    const list = await admin.agent.get('/api/admin/messages');
    assert.ok(list.body.data.length >= 3);
    assert.ok(list.body.meta.unread >= 2);
    const id = list.body.data[0]._id;
    assert.equal((await admin.agent.patch(`/api/admin/messages/${id}`).send({ isRead: true })).body.data.isRead, true);
    assert.equal((await admin.agent.delete(`/api/admin/messages/${id}`)).status, 200);
  });
});
