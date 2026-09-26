import { Appointment } from '../models/Appointment.js';
import { APPOINTMENT_POPULATE } from './appointmentService.js';
import { escapeRegex, getPagination, pageMeta } from '../utils/pagination.js';
import { MIN, localToMs } from '../utils/time.js';

const DAY = 24 * 60 * MIN;

/** Shared search/filter/pagination for provider and admin appointment lists. */
export async function queryAppointments(baseFilter, query, { includeUser = true } = {}) {
  const filter = { ...baseFilter };
  const { status, q, date, from, to, provider } = query;
  const pg = getPagination(query, { defaultLimit: 10 });

  if (status) filter.status = status;
  if (provider && !filter.provider) filter.provider = provider;

  const range = {};
  if (date) {
    range.$gte = new Date(localToMs(date, '00:00'));
    range.$lt = new Date(localToMs(date, '00:00') + DAY);
  } else {
    if (from) range.$gte = new Date(localToMs(from, '00:00'));
    if (to) range.$lt = new Date(localToMs(to, '00:00') + DAY);
  }
  if (Object.keys(range).length) filter.startAt = range;

  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ 'customer.name': rx }, { 'customer.phone': rx }, { serviceName: rx }];
  }

  const populate = includeUser ? [...APPOINTMENT_POPULATE, { path: 'user', select: 'name email phone' }] : APPOINTMENT_POPULATE;
  const [total, data] = await Promise.all([
    Appointment.countDocuments(filter),
    Appointment.find(filter).populate(populate).sort({ startAt: -1 }).skip(pg.skip).limit(pg.limit),
  ]);
  return { data, meta: pageMeta(total, pg) };
}
