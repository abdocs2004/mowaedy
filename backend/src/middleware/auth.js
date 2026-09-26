import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { COOKIE_NAME, verifyToken } from '../utils/token.js';

function extractToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[COOKIE_NAME];
}

async function resolveUser(req) {
  const token = extractToken(req);
  if (!token) return null;
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى', 401, 'TOKEN_EXPIRED');
    throw new AppError('جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى', 401, 'TOKEN_INVALID');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new AppError('الحساب غير موجود', 401, 'TOKEN_INVALID');
  if (!user.isActive) throw new AppError('تم تعطيل هذا الحساب، تواصل مع الدعم', 403, 'ACCOUNT_DISABLED');
  if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw new AppError('تم تغيير كلمة المرور، يرجى تسجيل الدخول مرة أخرى', 401, 'TOKEN_INVALID');
  }
  return user;
}

/** Requires a valid session. Attaches req.user. */
export const protect = asyncHandler(async (req, _res, next) => {
  const user = await resolveUser(req);
  if (!user) throw AppError.unauthorized();
  req.user = user;
  next();
});

/** Attaches req.user when a valid session exists, otherwise continues anonymously. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  try {
    req.user = (await resolveUser(req)) || undefined;
  } catch {
    req.user = undefined;
  }
  next();
});

/** Role-based authorization. Use after `protect`. */
export const restrictTo = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(AppError.forbidden());
  next();
};
