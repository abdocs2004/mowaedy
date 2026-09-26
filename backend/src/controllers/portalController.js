import { Provider } from '../models/Provider.js';
import { Service } from '../models/Service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { changeStatus } from '../services/appointmentService.js';
import { queryAppointments } from '../services/appointmentQuery.js';
import { getProviderStats } from '../services/statsService.js';
import { assertDurationFitsGrid, removeOrDeactivateService } from './serviceHelpers.js';
import { loadAccessibleAppointment } from './appointmentController.js';

/** Provider dashboard endpoints: everything is scoped to the logged-in provider. */
export const loadOwnProvider = asyncHandler(async (req, _res, next) => {
  const provider = await Provider.findOne({ owner: req.user._id }).populate('category', 'slug nameAr singularAr');
  if (!provider) throw AppError.notFound('لا يوجد ملف مقدم خدمة مرتبط بحسابك');
  req.provider = provider;
  next();
});

export const getOwnProfile = (req, res) => res.json({ data: req.provider });

export const updateOwnProfile = asyncHandler(async (req, res) => {
  const provider = req.provider;
  if (req.body.slotMinutes && req.body.slotMinutes !== provider.slotMinutes) {
    const services = await Service.find({ provider: provider._id, isActive: true }).select('durationMinutes name');
    const bad = services.find((s) => s.durationMinutes % req.body.slotMinutes !== 0);
    if (bad) throw AppError.badRequest(`لا يمكن تغيير مدة الفترة الزمنية لأن مدة الخدمة "${bad.name}" ليست من مضاعفاتها`);
  }
  Object.assign(provider, req.body);
  await provider.save();
  res.json({ message: 'تم حفظ التغييرات', data: provider });
});

export const listOwnServices = asyncHandler(async (req, res) => {
  const data = await Service.find({ provider: req.provider._id }).sort({ isActive: -1, createdAt: 1 });
  res.json({ data });
});

export const createOwnService = asyncHandler(async (req, res) => {
  assertDurationFitsGrid(req.body.durationMinutes, req.provider.slotMinutes);
  const service = await Service.create({ ...req.body, provider: req.provider._id });
  res.status(201).json({ message: 'تمت إضافة الخدمة', data: service });
});

export const updateOwnService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, provider: req.provider._id });
  if (!service) throw AppError.notFound('الخدمة غير موجودة');
  if (req.body.durationMinutes) assertDurationFitsGrid(req.body.durationMinutes, req.provider.slotMinutes);
  Object.assign(service, req.body);
  await service.save();
  res.json({ message: 'تم تحديث الخدمة', data: service });
});

export const deleteOwnService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, provider: req.provider._id });
  if (!service) throw AppError.notFound('الخدمة غير موجودة');
  const { message, deleted } = await removeOrDeactivateService(service);
  res.json({ message, data: { deleted } });
});

export const listOwnAppointments = asyncHandler(async (req, res) => {
  res.json(await queryAppointments({ provider: req.provider._id }, req.query));
});

export const updateOwnAppointmentStatus = asyncHandler(async (req, res) => {
  const appt = await loadAccessibleAppointment(req.params.id, req.user);
  if (String(appt.provider) !== String(req.provider._id)) throw AppError.notFound('الموعد غير موجود');
  const updated = await changeStatus(appt, req.body.status, { role: 'provider', id: req.user._id }, req.body.reason);
  await updated.populate([{ path: 'service', select: 'name price durationMinutes' }, { path: 'user', select: 'name email phone' }]);
  res.json({ message: 'تم تحديث حالة الموعد', data: updated });
});

export const getOwnStats = asyncHandler(async (req, res) => {
  res.json({ data: await getProviderStats(req.provider._id) });
});

