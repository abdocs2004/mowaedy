import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookie, setAuthCookie, signToken } from '../utils/token.js';

async function userPayload(user) {
  const data = user.toJSON();
  if (user.role === 'provider') {
    const provider = await Provider.findOne({ owner: user._id }).select('_id name isActive');
    data.provider = provider ? provider.toJSON() : null;
  }
  return data;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (await User.exists({ email })) throw AppError.conflict('هذا البريد الإلكتروني مسجّل بالفعل', 'EMAIL_TAKEN');
  const user = await User.create({ name, email, phone, password, role: 'user' });
  setAuthCookie(res, user._id);
  res.status(201).json({ message: 'تم إنشاء حسابك بنجاح', data: { user: await userPayload(user), token: signToken(user._id) } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown email and wrong password (avoids account enumeration).
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401, 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) throw new AppError('تم تعطيل هذا الحساب، تواصل مع الدعم', 403, 'ACCOUNT_DISABLED');
  user.lastLoginAt = new Date();
  await user.save({ validateModifiedOnly: true });
  setAuthCookie(res, user._id);
  res.json({ message: 'تم تسجيل الدخول بنجاح', data: { user: await userPayload(user), token: signToken(user._id) } });
});

export const logout = (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'تم تسجيل الخروج' });
};

export const me = asyncHandler(async (req, res) => {
  res.json({ data: { user: await userPayload(req.user) } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json({ message: 'تم تحديث بياناتك', data: { user: await userPayload(req.user) } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw new AppError('كلمة المرور الحالية غير صحيحة', 400, 'WRONG_PASSWORD');
  }
  user.password = req.body.newPassword;
  await user.save();
  setAuthCookie(res, user._id); // re-issue: old tokens are invalidated by passwordChangedAt
  res.json({ message: 'تم تغيير كلمة المرور', data: { token: signToken(user._id) } });
});
