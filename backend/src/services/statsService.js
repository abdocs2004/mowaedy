import { Appointment } from '../models/Appointment.js';
import { Provider } from '../models/Provider.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { APPOINTMENT_POPULATE } from './appointmentService.js';
import { STATUS_VALUES } from '../config/constants.js';
import { MIN, addDaysStr, formatLocal, localToMs, todayStr } from '../utils/time.js';

const DAY = 24 * 60 * MIN;

async function statusCounts(filter) {
  const entries = await Promise.all(STATUS_VALUES.map(async (s) => [s, await Appointment.countDocuments({ ...filter, status: s })]));
  return Object.fromEntries(entries);
}

async function revenue(filter) {
  const rows = await Appointment.aggregate([
    { $match: { ...filter, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);
  return rows[0]?.total ?? 0;
}

/** Appointments per day (business timezone) for the last `days` days, ending today. */
async function dailySeries(filter, days) {
  const today = todayStr();
  const first = addDaysStr(today, -(days - 1));
  const rows = await Appointment.find({
    ...filter,
    startAt: { $gte: new Date(localToMs(first, '00:00')), $lt: new Date(localToMs(today, '00:00') + DAY) },
  })
    .select('startAt status')
    .lean();
  const buckets = new Map();
  for (let i = 0; i < days; i += 1) buckets.set(addDaysStr(first, i), { date: addDaysStr(first, i), total: 0, cancelled: 0 });
  for (const r of rows) {
    const b = buckets.get(formatLocal(r.startAt.getTime(), 'YYYY-MM-DD'));
    if (!b) continue;
    b.total += 1;
    if (r.status === 'cancelled') b.cancelled += 1;
  }
  return [...buckets.values()];
}

export async function getAdminStats() {
  const [users, providersTotal, providersActive, byStatus, totalRevenue, series, categories, providerAgg, recent, unreadMessages] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Provider.countDocuments(),
    Provider.countDocuments({ isActive: true }),
    statusCounts({}),
    revenue({}),
    dailySeries({}, 30),
    Category.find().sort({ order: 1 }).lean(),
    Appointment.aggregate([{ $group: { _id: '$provider', count: { $sum: 1 } } }]),
    Appointment.find().sort({ createdAt: -1 }).limit(6).populate(APPOINTMENT_POPULATE),
    ContactMessage.countDocuments({ isRead: false }),
  ]);

  const providers = await Provider.find().select('name category image').lean();
  const provById = new Map(providers.map((p) => [String(p._id), p]));
  const catCount = new Map();
  for (const row of providerAgg) {
    const p = provById.get(String(row._id));
    if (p) catCount.set(String(p.category), (catCount.get(String(p.category)) || 0) + row.count);
  }
  const topProviders = [...providerAgg]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((r) => ({ id: r._id, name: provById.get(String(r._id))?.name ?? '—', image: provById.get(String(r._id))?.image ?? '', count: r.count }));

  return {
    totals: {
      users,
      providers: providersTotal,
      activeProviders: providersActive,
      appointments: Object.values(byStatus).reduce((a, b) => a + b, 0),
      revenue: totalRevenue,
      unreadMessages,
    },
    byStatus,
    byCategory: categories.map((c) => ({ id: c._id, slug: c.slug, name: c.nameAr, count: catCount.get(String(c._id)) || 0 })),
    series,
    topProviders,
    recent,
  };
}

export async function getProviderStats(providerId) {
  const filter = { provider: providerId };
  const today = todayStr();
  const startToday = localToMs(today, '00:00');
  const [byStatus, totalRevenue, series, todayCount, upcoming] = await Promise.all([
    statusCounts(filter),
    revenue(filter),
    dailySeries(filter, 14),
    Appointment.countDocuments({ ...filter, status: { $in: ['pending', 'confirmed'] }, startAt: { $gte: new Date(startToday), $lt: new Date(startToday + DAY) } }),
    Appointment.find({ ...filter, status: { $in: ['pending', 'confirmed'] }, startAt: { $gte: new Date() } })
      .sort({ startAt: 1 })
      .limit(5)
      .populate([{ path: 'service', select: 'name' }]),
  ]);
  return {
    totals: { appointments: Object.values(byStatus).reduce((a, b) => a + b, 0), revenue: totalRevenue, today: todayCount },
    byStatus,
    series,
    upcoming,
  };
}
