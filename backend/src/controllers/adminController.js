import { Appointment } from '../models/Appointment.js';
import { Category } from '../models/Category.js';
import { Provider } from '../models/Provider.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { defaultWorkingHours } from '../utils/defaults.js';
import { escapeRegex, getPagination, pageMeta } from '../utils/pagination.js';
import { changeStatus, APPOINTMENT_POPULATE } from '../services/appointmentService.js';
import { queryAppointments } from '../services/appointmentQuery.js';
import { getAdminStats } from '../services/statsService.js';
import { assertDurationFitsGrid, removeOrDeactivateService } from './serviceHelpers.js';

/* ------------------------------ stats ------------------------------ */
export const stats = asyncHandler(async (_req, res) => res.json({ data: await getAdminStats() }));

/* ------------------------------ users ------------------------------ */
export const listUsers = asyncHandler(async (req, res) => {
  const { q, role, isActive } = req.query;
  const pg = getPagination(req.query);
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit),
  ]);
  res.json({ data: users, meta: pageMeta(total, pg) });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError.notFound('المستخدم غير موجود');
  const byStatus = {};
  for (const s of ['pending', 'confirmed', 'completed', 'cancelled']) {
    byStatus[s] = await Appointment.countDocuments({ user: user._id, status: s });
  }
  const recent = await Appointment.find({ user: user._id }).populate(APPOINTMENT_POPULATE).sort({ startAt: -1 }).limit(5);
  res.json({ data: { user, appointments: { byStatus, recent } } });
});

export const createUser = asyncHandler(async (req, res) => {
  if (await User.exists({ email: req.body.email })) throw AppError.conflict('هذا البريد الإلكتروني مسجّل بالفعل', 'EMAIL_TAKEN');
  const user = await User.create(req.body);
  res.status(201).json({ message: 'تمت إضافة المستخدم', data: user });
});

/** Guards so the platform can never be left without a working admin. */
async function assertNotLastAdmin(user, changes = {}) {
  if (user.role !== 'admin') return;
  const losing = changes.isActive === false || (changes.role && changes.role !== 'admin');
  if (!losing) return;
  const others = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: user._id } });
  if (!others) throw AppError.badRequest('لا يمكن تعطيل أو تغيير صلاحيات آخر مدير في المنصة');
}

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError.notFound('المستخدم غير موجود');
  if (String(user._id) === String(req.user._id) && (req.body.role || req.body.isActive === false)) {
    throw AppError.badRequest('لا يمكنك تغيير صلاحياتك أو تعطيل حسابك بنفسك');
  }
  if (req.body.role === 'provider' && user.role !== 'provider') {
    throw AppError.badRequest('لتحويل مستخدم إلى مقدم خدمة، أنشئ مقدم خدمة جديداً من قسم مقدمي الخدمة');
  }
  if (user.role === 'provider' && req.body.role && req.body.role !== 'provider') {
    throw AppError.badRequest('لا يمكن تغيير دور حساب مقدم خدمة مرتبط بملف نشاط');
  }
  await assertNotLastAdmin(user, req.body);
  if (req.body.email && req.body.email !== user.email && (await User.exists({ email: req.body.email }))) {
    throw AppError.conflict('هذا البريد الإلكتروني مسجّل بالفعل', 'EMAIL_TAKEN');
  }
  Object.assign(user, req.body);
  await user.save();
  res.json({ message: 'تم تحديث بيانات المستخدم', data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError.notFound('المستخدم غير موجود');
  if (String(user._id) === String(req.user._id)) throw AppError.badRequest('لا يمكنك حذف حسابك بنفسك');
  if (user.role === 'provider') throw AppError.conflict('هذا حساب مقدم خدمة، احذفه من قسم مقدمي الخدمة');
  await assertNotLastAdmin(user, { isActive: false });
  if (await Appointment.exists({ user: user._id })) {
    throw AppError.conflict('لا يمكن حذف مستخدم لديه مواعيد مسجلة. يمكنك تعطيل حسابه بدلاً من ذلك', 'HAS_APPOINTMENTS');
  }
  await user.deleteOne();
  res.json({ message: 'تم حذف المستخدم' });
});

/* ---------------------------- providers ---------------------------- */
const OWNER_POPULATE = { path: 'owner', select: 'name email phone isActive' };
const CATEGORY_POPULATE = { path: 'category', select: 'slug nameAr singularAr' };

export const listProviders = asyncHandler(async (req, res) => {
  const { q, category, isActive } = req.query;
  const pg = getPagination(req.query);
  const filter = {};
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { businessName: rx }, { city: rx }, { address: rx }];
  }
  const [total, data] = await Promise.all([
    Provider.countDocuments(filter),
    Provider.find(filter).populate([OWNER_POPULATE, CATEGORY_POPULATE]).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit),
  ]);
  res.json({ data, meta: pageMeta(total, pg) });
});

export const getProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id).populate([OWNER_POPULATE, CATEGORY_POPULATE]);
  if (!provider) throw AppError.notFound('مقدم الخدمة غير موجود');
  const services = await Service.find({ provider: provider._id }).sort({ createdAt: 1 });
  const appointments = await Appointment.countDocuments({ provider: provider._id });
  res.json({ data: { ...provider.toJSON(), services, appointmentsCount: appointments } });
});

export const createProvider = asyncHandler(async (req, res) => {
  const { owner, category: categoryId, ...profile } = req.body;
  const category = await Category.findById(categoryId);
  if (!category) throw AppError.badRequest('القسم المحدد غير موجود');
  if (await User.exists({ email: owner.email })) throw AppError.conflict('هذا البريد الإلكتروني مسجّل بالفعل', 'EMAIL_TAKEN');

  const ownerUser = await User.create({ ...owner, role: 'provider' });
  try {
    const provider = await Provider.create({
      ...profile,
      owner: ownerUser._id,
      category: category._id,
      workingHours: profile.workingHours ?? defaultWorkingHours(category.slug),
    });
    await provider.populate([OWNER_POPULATE, CATEGORY_POPULATE]);
    res.status(201).json({ message: 'تمت إضافة مقدم الخدمة', data: provider });
  } catch (err) {
    await User.deleteOne({ _id: ownerUser._id }); // no orphan owner accounts
    throw err;
  }
});

export const updateProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) throw AppError.notFound('مقدم الخدمة غير موجود');
  if (req.body.category && !(await Category.exists({ _id: req.body.category }))) throw AppError.badRequest('القسم المحدد غير موجود');
  Object.assign(provider, req.body);
  await provider.save();
  await provider.populate([OWNER_POPULATE, CATEGORY_POPULATE]);
  res.json({ message: 'تم تحديث بيانات مقدم الخدمة', data: provider });
});

export const deleteProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) throw AppError.notFound('مقدم الخدمة غير موجود');
  if (await Appointment.exists({ provider: provider._id })) {
    throw AppError.conflict('لا يمكن حذف مقدم خدمة لديه مواعيد مسجلة. يمكنك تعطيله بدلاً من ذلك', 'HAS_APPOINTMENTS');
  }
  await Service.deleteMany({ provider: provider._id });
  await User.deleteOne({ _id: provider.owner, role: 'provider' });
  await provider.deleteOne();
  res.json({ message: 'تم حذف مقدم الخدمة' });
});

/* ----------------------------- services ---------------------------- */
export const listServices = asyncHandler(async (req, res) => {
  const { provider, q } = req.query;
  const pg = getPagination(req.query);
  const filter = {};
  if (provider) filter.provider = provider;
  if (q) filter.name = new RegExp(escapeRegex(q), 'i');
  const [total, data] = await Promise.all([
    Service.countDocuments(filter),
    Service.find(filter).populate('provider', 'name category').sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit),
  ]);
  res.json({ data, meta: pageMeta(total, pg) });
});

export const createService = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.body.provider);
  if (!provider) throw AppError.badRequest('مقدم الخدمة غير موجود');
  assertDurationFitsGrid(req.body.durationMinutes, provider.slotMinutes);
  const service = await Service.create(req.body);
  res.status(201).json({ message: 'تمت إضافة الخدمة', data: service });
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw AppError.notFound('الخدمة غير موجودة');
  if (req.body.durationMinutes) {
    const provider = await Provider.findById(service.provider).select('slotMinutes');
    assertDurationFitsGrid(req.body.durationMinutes, provider.slotMinutes);
  }
  Object.assign(service, req.body);
  await service.save();
  res.json({ message: 'تم تحديث الخدمة', data: service });
});

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw AppError.notFound('الخدمة غير موجودة');
  const { message, deleted } = await removeOrDeactivateService(service);
  res.json({ message, data: { deleted } });
});

/* --------------------------- appointments -------------------------- */
export const listAppointments = asyncHandler(async (req, res) => {
  res.json(await queryAppointments({}, req.query));
});

export const getAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id).populate([...APPOINTMENT_POPULATE, { path: 'user', select: 'name email phone' }]);
  if (!appt) throw AppError.notFound('الموعد غير موجود');
  res.json({ data: appt });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw AppError.notFound('الموعد غير موجود');
  const updated = await changeStatus(appt, req.body.status, { role: 'admin', id: req.user._id }, req.body.reason);
  await updated.populate([...APPOINTMENT_POPULATE, { path: 'user', select: 'name email phone' }]);
  res.json({ message: 'تم تحديث حالة الموعد', data: updated });
});
