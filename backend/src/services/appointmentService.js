import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { SlotLock } from '../models/SlotLock.js';
import { Provider } from '../models/Provider.js';
import { Service } from '../models/Service.js';
import { env } from '../config/env.js';
import { ACTIVE_STATUSES, APPOINTMENT_STATUS as S, STATUS_LABELS_AR, STATUS_TRANSITIONS } from '../config/constants.js';
import { AppError } from '../utils/AppError.js';
import { MIN, formatLocal } from '../utils/time.js';
import { buildLockKeys, computeSlots, findBusy } from './slotService.js';

export const APPOINTMENT_POPULATE = [
  { path: 'provider', select: 'name businessName image phone address city category', populate: { path: 'category', select: 'slug nameAr singularAr' } },
  { path: 'service', select: 'name price durationMinutes' },
];

/** Creates an appointment after validating the slot against the provider's real availability. */
export async function bookAppointment({ user, providerId, serviceId, startAt, customerName, customerPhone, notes }) {
  const provider = await Provider.findOne({ _id: providerId, isActive: true });
  if (!provider) throw AppError.notFound('مقدم الخدمة غير موجود أو غير متاح حالياً');
  if (String(provider.owner) === String(user._id)) throw AppError.forbidden('لا يمكنك حجز موعد لدى حسابك الخاص');

  const service = await Service.findOne({ _id: serviceId, provider: provider._id, isActive: true });
  if (!service) throw AppError.notFound('الخدمة غير موجودة أو غير متاحة لدى مقدم الخدمة هذا');

  const start = new Date(startAt);
  const startMs = start.getTime();
  const endMs = startMs + service.durationMinutes * MIN;
  const dateStr = formatLocal(startMs, 'YYYY-MM-DD');

  // 1) Is this a real, bookable slot (working hours, breaks, notice period, advance window)?
  const structural = computeSlots(provider, service.durationMinutes, dateStr, []);
  if (!structural.some((s) => s.start === start.toISOString())) {
    throw new AppError('الموعد المختار غير متاح للحجز، يرجى اختيار موعد من المواعيد المتاحة', 400, 'INVALID_SLOT');
  }

  // 2) Friendly conflict checks (the unique index below is the real guarantee).
  const busy = await findBusy(provider._id, startMs, endMs);
  if (busy.length) throw AppError.conflict('عذراً، هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر', 'SLOT_TAKEN');

  const userOverlap = await Appointment.exists({
    user: user._id,
    status: { $in: ACTIVE_STATUSES },
    startAt: { $lt: new Date(endMs) },
    endAt: { $gt: start },
  });
  if (userOverlap) throw AppError.conflict('لديك موعد آخر في نفس الوقت', 'USER_OVERLAP');

  // 3) Claim every slot cell atomically. The unique index on SlotLock.key is the real guarantee:
  //    if a concurrent request already holds one of the cells, insertion fails and we back out.
  const _id = new mongoose.Types.ObjectId();
  const keys = buildLockKeys(provider._id, startMs, endMs, provider.slotMinutes);
  try {
    await SlotLock.insertMany(keys.map((key) => ({ key, appointment: _id })), { ordered: true });
  } catch (err) {
    await SlotLock.deleteMany({ appointment: _id });
    if (err.code === 11000) throw AppError.conflict('عذراً، تم حجز هذا الموعد للتو. يرجى اختيار موعد آخر', 'SLOT_TAKEN');
    throw err;
  }

  let appointment;
  try {
    appointment = await Appointment.create({
      _id,
      user: user._id,
      provider: provider._id,
      service: service._id,
      startAt: start,
      endAt: new Date(endMs),
      status: provider.autoConfirm ? S.CONFIRMED : S.PENDING,
      serviceName: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
      customer: { name: customerName || user.name, phone: customerPhone || user.phone || '', email: user.email },
      notes: notes || '',
    });
  } catch (err) {
    await SlotLock.deleteMany({ appointment: _id }); // never leave orphan locks
    throw err;
  }
  return appointment;
}

/**
 * Moves an appointment to a new status atomically (compare-and-set on the current status).
 * actor: { role: 'user'|'provider'|'admin', id }
 */
export async function changeStatus(appointment, nextStatus, actor, reason) {
  const current = appointment.status;
  if (current === nextStatus) throw AppError.badRequest(`الموعد بالفعل ${STATUS_LABELS_AR[current]}`);
  if (!STATUS_TRANSITIONS[current].includes(nextStatus)) {
    throw AppError.badRequest(`لا يمكن تغيير حالة الموعد من "${STATUS_LABELS_AR[current]}" إلى "${STATUS_LABELS_AR[nextStatus]}"`);
  }

  const now = Date.now();
  if (actor.role === 'user') {
    if (nextStatus !== S.CANCELLED) throw AppError.forbidden();
    const limit = env.cancelWindowHours * 60 * MIN;
    if (appointment.startAt.getTime() - now < limit) {
      throw AppError.badRequest(`لا يمكن إلغاء الموعد قبل أقل من ${env.cancelWindowHours} ساعة من موعده، يرجى التواصل مع مقدم الخدمة`);
    }
  }
  if (nextStatus === S.CONFIRMED && appointment.endAt.getTime() < now) {
    throw AppError.badRequest('لا يمكن تأكيد موعد انتهى وقته');
  }
  if (nextStatus === S.COMPLETED && appointment.startAt.getTime() > now) {
    throw AppError.badRequest('لا يمكن إكمال موعد لم يحن وقته بعد');
  }

  const $set = { status: nextStatus };
  const update = { $set };
  if (nextStatus === S.CANCELLED) {
    $set.cancelledBy = actor.role;
    $set.cancelledAt = new Date();
    if (reason) $set.cancelReason = reason;
  }
  // Free the slot as soon as the appointment stops being active.
  const updated = await Appointment.findOneAndUpdate({ _id: appointment._id, status: current }, update, { new: true });
  if (!updated) throw AppError.conflict('تم تحديث هذا الموعد للتو، يرجى إعادة تحميل الصفحة');
  if (!ACTIVE_STATUSES.includes(nextStatus)) await SlotLock.deleteMany({ appointment: updated._id });
  return updated;
}
