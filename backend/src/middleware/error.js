import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, _res, next) =>
  next(new AppError(`المسار غير موجود: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let error = err;

  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    error = new AppError(Object.values(errors)[0] || 'بيانات غير صالحة', 400, 'VALIDATION_ERROR', errors);
  } else if (err.name === 'CastError') {
    error = new AppError('معرّف غير صالح', 400, 'INVALID_ID');
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    if (field === 'key') {
      error = AppError.conflict('عذراً، تم حجز هذا الموعد للتو. يرجى اختيار موعد آخر', 'SLOT_TAKEN');
    } else if (field === 'email') {
      error = AppError.conflict('هذا البريد الإلكتروني مسجّل بالفعل', 'EMAIL_TAKEN');
    } else {
      error = AppError.conflict('هذه البيانات موجودة بالفعل');
    }
  } else if (err.type === 'entity.parse.failed') {
    error = AppError.badRequest('صيغة البيانات المرسلة غير صحيحة');
  } else if (err.type === 'entity.too.large') {
    error = new AppError('حجم البيانات المرسلة كبير جداً', 413, 'PAYLOAD_TOO_LARGE');
  }

  if (!error.isOperational) {
    console.error('💥 Unexpected error:', err);
    error = new AppError('حدث خطأ غير متوقع، يرجى المحاولة لاحقاً', 500, 'INTERNAL_ERROR');
  }

  const body = { success: false, message: error.message, code: error.code };
  if (error.errors) body.errors = error.errors;
  if (!env.isProd && error.status === 500) body.stack = err.stack;
  res.status(error.status).json(body);
}
