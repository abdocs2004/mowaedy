import { Appointment } from '../models/Appointment.js';
import { ACTIVE_STATUSES } from '../config/constants.js';
import { MIN, TZ, addDaysStr, formatLocal, isValidDateStr, localToMs, parseLocalDate, todayStr } from '../utils/time.js';

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

/**
 * Pure slot calculator (no DB) — easy to unit test.
 * @param provider  { workingHours, slotMinutes, minNoticeMinutes, maxAdvanceDays }
 * @param durationMinutes  service duration
 * @param dateStr  "YYYY-MM-DD" in the business timezone
 * @param busy  [{ startAt: Date, endAt: Date }] active appointments of that provider
 * @returns [{ start: ISO, end: ISO, time: "HH:mm" }]
 */
export function computeSlots(provider, durationMinutes, dateStr, busy = [], now = new Date()) {
  if (!isValidDateStr(dateStr)) return [];
  const today = todayStr(now);
  if (dateStr < today) return [];
  if (dateStr > addDaysStr(today, provider.maxAdvanceDays ?? 30)) return [];

  const dow = parseLocalDate(dateStr).day();
  const rule = provider.workingHours?.find((w) => w.day === dow);
  if (!rule || !rule.isOpen) return [];

  const earliest = now.getTime() + (provider.minNoticeMinutes ?? 0) * MIN;
  const openMs = localToMs(dateStr, rule.start);
  const closeMs = localToMs(dateStr, rule.end);
  const stepMs = (provider.slotMinutes || 30) * MIN;
  const durMs = durationMinutes * MIN;
  const breaks = (rule.breaks || []).map((b) => [localToMs(dateStr, b.start), localToMs(dateStr, b.end)]);
  const busyMs = busy.map((b) => [b.startAt.getTime(), b.endAt.getTime()]);

  const slots = [];
  for (let s = openMs; s + durMs <= closeMs; s += stepMs) {
    const e = s + durMs;
    if (s < earliest) continue;
    if (breaks.some(([bs, be]) => overlaps(s, e, bs, be))) continue;
    if (busyMs.some(([bs, be]) => overlaps(s, e, bs, be))) continue;
    slots.push({ start: new Date(s).toISOString(), end: new Date(e).toISOString(), time: formatLocal(s) });
  }
  return slots;
}

/** Active (pending/confirmed) appointments of a provider overlapping [fromMs, toMs). */
export function findBusy(providerId, fromMs, toMs) {
  return Appointment.find({
    provider: providerId,
    status: { $in: ACTIVE_STATUSES },
    startAt: { $lt: new Date(toMs) },
    endAt: { $gt: new Date(fromMs) },
  })
    .select('startAt endAt')
    .lean();
}

export async function getSlotsForDate(provider, service, dateStr, now = new Date()) {
  if (!isValidDateStr(dateStr)) return [];
  const from = localToMs(dateStr, '00:00');
  const busy = await findBusy(provider._id, from, from + 24 * 60 * MIN);
  return computeSlots(provider, service.durationMinutes, dateStr, busy, now);
}

/** Per-day availability summary for a date picker. */
export async function getAvailability(provider, service, fromStr, days, now = new Date()) {
  const start = fromStr && fromStr >= todayStr(now) ? fromStr : todayStr(now);
  const from = localToMs(start, '00:00');
  const busy = await findBusy(provider._id, from, from + (days + 1) * 24 * 60 * MIN);
  const result = [];
  for (let i = 0; i < days; i += 1) {
    const date = addDaysStr(start, i);
    const slots = computeSlots(provider, service.durationMinutes, date, busy, now);
    const dow = parseLocalDate(date).day();
    const rule = provider.workingHours?.find((w) => w.day === dow);
    result.push({ date, isOpen: Boolean(rule?.isOpen), availableSlots: slots.length });
  }
  return result;
}

/** One lock key per slot cell occupied by [startMs, endMs). */
export function buildLockKeys(providerId, startMs, endMs, slotMinutes) {
  const step = slotMinutes * MIN;
  const keys = [];
  for (let t = startMs; t < endMs; t += step) keys.push(`${providerId}:${t}`);
  return keys;
}

export { TZ };
