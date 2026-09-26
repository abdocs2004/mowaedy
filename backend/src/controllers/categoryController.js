import { Category } from '../models/Category.js';
import { Provider } from '../models/Provider.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listCategories = asyncHandler(async (req, res) => {
  const all = req.query.all === 'true' && req.user?.role === 'admin';
  const categories = await Category.find(all ? {} : { isActive: true }).sort({ order: 1, createdAt: 1 });
  res.json({ data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ message: 'تمت إضافة القسم', data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw AppError.notFound('القسم غير موجود');
  res.json({ message: 'تم تحديث القسم', data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Provider.countDocuments({ category: req.params.id });
  if (inUse) throw AppError.conflict(`لا يمكن حذف القسم لأنه مرتبط بـ ${inUse} من مقدمي الخدمة. يمكنك تعطيله بدلاً من ذلك`);
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw AppError.notFound('القسم غير موجود');
  res.json({ message: 'تم حذف القسم' });
});
