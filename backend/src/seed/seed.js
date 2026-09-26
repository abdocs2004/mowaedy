import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { Appointment, Category, ContactMessage, Provider, Service, SlotLock, User } from '../models/index.js';
import { defaultWorkingHours } from '../utils/defaults.js';
import { MIN, addDaysStr, formatLocal, localToMs, parseLocalDate, todayStr } from '../utils/time.js';
import { buildLockKeys } from '../services/slotService.js';
import { CREDENTIALS, categories, categoryConfig, providers, sampleUsers } from './data.js';

const args = new Set(process.argv.slice(2));

// Small deterministic PRNG so every seed run produces the same demo data.
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260924);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

export async function seed({ reset = false } = {}) {
  if (env.isProd && !args.has('--force')) {
    throw new Error('Refusing to seed in production (use --force if you really mean it).');
  }
  if (reset) {
    await Promise.all([SlotLock, Appointment, Service, Provider, Category, User, ContactMessage].map((m) => m.deleteMany({})));
  } else if (await User.exists({})) {
    throw new Error('Database is not empty. Run "npm run seed:reset" to wipe and re-seed it.');
  }

  // ---- admin ----
  const admin = await User.create({ name: env.seed.adminName, email: env.seed.adminEmail, password: env.seed.adminPassword, role: 'admin', phone: '01000000000' });

  // ---- categories ----
  const cats = await Category.insertMany(categories);
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  // ---- customers ----
  const users = [];
  for (const [i, u] of sampleUsers.entries()) {
    users.push(await User.create({ ...u, email: `user${i + 1}@mawaeedy.local`, password: CREDENTIALS.userPassword }));
  }

  // ---- providers + services ----
  const created = [];
  for (const [i, p] of providers.entries()) {
    const cfg = categoryConfig[p.category];
    const num = String(i + 1).padStart(2, '0');
    const owner = await User.create({
      name: p.name, email: `provider${num}@mawaeedy.local`, password: CREDENTIALS.providerPassword, role: 'provider',
      phone: `0100${String(1000000 + i * 111).slice(0, 7)}`,
    });
    const categoryData = p.category === 'clinic'
      ? { specialty: p.specialty, experienceYears: p.exp }
      : { experienceYears: p.exp, specialties: p.specialties, ...(p.facilities ? { facilities: p.facilities } : {}) };
    const provider = await Provider.create({
      owner: owner._id,
      category: catBySlug[p.category]._id,
      name: p.name,
      businessName: p.businessName,
      description: cfg.description(p),
      image: p.image,
      city: p.city,
      address: p.address,
      phone: owner.phone,
      whatsapp: owner.phone,
      workingHours: defaultWorkingHours(p.category),
      slotMinutes: cfg.slotMinutes,
      autoConfirm: Boolean(p.autoConfirm),
      categoryData,
      rating: { avg: p.rating, count: 8 + Math.floor(rand() * 90) },
    });
    // Price varies slightly with quality so the sample data isn't flat.
    const factor = 0.85 + p.rating * 0.06 + (p.exp > 12 ? 0.15 : 0);
    const services = await Service.insertMany(
      cfg.services.map((s) => ({ ...s, provider: provider._id, price: s.price === 0 ? 0 : Math.round((s.price * factor) / 10) * 10 }))
    );
    created.push({ provider, services });
  }

  // ---- appointments (past + upcoming, every status) ----
  const now = Date.now();
  const taken = new Set();
  const docs = [];
  const locks = [];
  let attempts = 0;
  while (docs.length < 70 && attempts < 1500) {
    attempts += 1;
    const { provider, services } = pick(created);
    const service = pick(services);
    const offset = Math.floor(rand() * 45) - 28; // -28 … +16 days
    const date = addDaysStr(todayStr(), offset);
    const rule = provider.workingHours.find((w) => w.day === parseLocalDate(date).day());
    if (!rule?.isOpen) continue;

    const open = localToMs(date, rule.start);
    const close = localToMs(date, rule.end);
    const step = provider.slotMinutes * MIN;
    const dur = service.durationMinutes * MIN;
    const cells = Math.floor((close - open - dur) / step) + 1;
    const start = open + Math.floor(rand() * cells) * step;
    const end = start + dur;
    const breaks = rule.breaks.map((b) => [localToMs(date, b.start), localToMs(date, b.end)]);
    if (breaks.some(([bs, be]) => start < be && end > bs)) continue;

    const keys = buildLockKeys(provider._id, start, end, provider.slotMinutes);

    let status;
    const r = rand();
    if (end < now) status = r < 0.72 ? 'completed' : r < 0.9 ? 'cancelled' : 'completed';
    else status = r < 0.4 ? 'pending' : r < 0.85 ? 'confirmed' : 'cancelled';
    if (status === 'pending' && provider.autoConfirm) status = 'confirmed';

    const active = status === 'pending' || status === 'confirmed';
    if (active && keys.some((k) => taken.has(k))) continue;
    if (active) keys.forEach((k) => taken.add(k));

    const user = pick(users);
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      user: user._id, provider: provider._id, service: service._id,
      startAt: new Date(start), endAt: new Date(end), status,
      serviceName: service.name, price: service.price, durationMinutes: service.durationMinutes,
      customer: { name: user.name, phone: user.phone, email: user.email },
      notes: rand() < 0.2 ? 'أفضّل الحضور مبكراً قليلاً' : '',
    };
    if (active) locks.push(...keys.map((key) => ({ key, appointment: doc._id })));
    if (status === 'cancelled') Object.assign(doc, { cancelledBy: pick(['user', 'user', 'provider']), cancelledAt: new Date(Math.min(now, start - 3 * 60 * MIN)) });
    docs.push(doc);
  }
  await Appointment.insertMany(docs);
  await SlotLock.insertMany(locks);

  await ContactMessage.insertMany([
    { name: 'كريم عادل', email: 'karim@example.com', subject: 'استفسار عن الانضمام كمقدم خدمة', message: 'أمتلك صالون حلاقة وأرغب في إضافته على المنصة، ما هي الخطوات المطلوبة؟' },
    { name: 'دينا مصطفى', email: 'dina@example.com', subject: 'مشكلة في الحجز', message: 'حاولت حجز موعد ولم يصلني تأكيد، برجاء المساعدة.', isRead: true },
  ]);

  return { admin, users, providers: created, appointments: docs.length };
}

async function main() {
  await connectDB();
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  try {
    const res = await seed({ reset: args.has('--reset') });
    const line = '─'.repeat(64);
    console.log(`\n✅ Seed complete: ${res.providers.length} providers, ${res.users.length} customers, ${res.appointments} appointments\n${line}`);
    console.log('Development credentials');
    console.log(`  Admin     ${env.seed.adminEmail}   /  ${env.seed.adminPassword}`);
    console.log(`  Customer  user1@mawaeedy.local … user${res.users.length}@mawaeedy.local   /  ${CREDENTIALS.userPassword}`);
    console.log(`  Provider  provider01@mawaeedy.local … provider${String(res.providers.length).padStart(2, '0')}@mawaeedy.local   /  ${CREDENTIALS.providerPassword}`);
    console.log(`${line}\n(dates shown in ${env.timezone}; today = ${formatLocal(Date.now(), 'YYYY-MM-DD')})`);
  } catch (err) {
    console.error('❌', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
