import { Appointment } from '../models/Appointment.js';
import { Provider } from '../models/Provider.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, pageMeta } from '../utils/pagination.js';
import { APPOINTMENT_POPULATE, bookAppointment, changeStatus } from '../services/appointmentService.js';

export const createAppointment = asyncHandler(async (req, res) => {
  const appt = await bookAppointment({ user: req.user, ...req.body });
  const populated = await appt.populate(APPOINTMENT_POPULATE);
  const message = appt.status === 'confirmed' ? 'تم تأكيد حجزك بنجاح' : 'تم إرسال طلب الحجز، بانتظار تأكيد مقدم الخدمة';
  res.status(201).json({ message, data: populated });
});

export const listMyAppointments = asyncHandler(async (req, res) => {
  const { status, scope } = req.query;
  const pg = getPagination(req.query, { defaultLimit: 10 });
  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (scope === 'upcoming') Object.assign(filter, { startAt: { $gte: new Date() }, status: status || { $in: ['pending', 'confirmed'] } });
  if (scope === 'past') filter.startAt = { $lt: new Date() };
  const sort = scope === 'upcoming' ? { startAt: 1 } : { startAt: -1 };
  const [total, data] = await Promise.all([
    Appointment.countDocuments(filter),
    Appointment.find(filter).populate(APPOINTMENT_POPULATE).sort(sort).skip(pg.skip).limit(pg.limit),
  ]);
  res.json({ data, meta: pageMeta(total, pg) });
});

/** Owner of the appointment, the provider it belongs to, or an admin. */
export async function loadAccessibleAppointment(id, user) {
  const appt = await Appointment.findById(id);
  if (!appt) throw AppError.notFound('الموعد غير موجود');
  if (user.role === 'admin') return appt;
  if (String(appt.user) === String(user._id)) return appt;
  if (user.role === 'provider') {
    const provider = await Provider.findOne({ owner: user._id }).select('_id');
    if (provider && String(provider._id) === String(appt.provider)) return appt;
  }
  // Don't reveal that it exists.
  throw AppError.notFound('الموعد غير موجود');
}

export const getAppointment = asyncHandler(async (req, res) => {
  const appt = await loadAccessibleAppointment(req.params.id, req.user);
  const populated = await appt.populate([...APPOINTMENT_POPULATE, { path: 'user', select: 'name email phone' }]);
  res.json({ data: populated });
});

export const cancelMyAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
  if (!appt) throw AppError.notFound('الموعد غير موجود');
  const updated = await changeStatus(appt, 'cancelled', { role: 'user', id: req.user._id }, req.body.reason);
  res.json({ message: 'تم إلغاء الموعد', data: await updated.populate(APPOINTMENT_POPULATE) });
});
