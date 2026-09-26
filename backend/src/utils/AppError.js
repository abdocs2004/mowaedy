/** Operational error that is safe to show to the client (message is Arabic). */
export class AppError extends Error {
  constructor(message, status = 400, code = 'BAD_REQUEST', errors) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
  }
  static badRequest(msg = 'طلب غير صالح', errors) { return new AppError(msg, 400, 'BAD_REQUEST', errors); }
  static unauthorized(msg = 'يجب تسجيل الدخول أولاً') { return new AppError(msg, 401, 'UNAUTHORIZED'); }
  static forbidden(msg = 'ليست لديك صلاحية للقيام بهذا الإجراء') { return new AppError(msg, 403, 'FORBIDDEN'); }
  static notFound(msg = 'العنصر المطلوب غير موجود') { return new AppError(msg, 404, 'NOT_FOUND'); }
  static conflict(msg = 'يوجد تعارض في البيانات', code = 'CONFLICT') { return new AppError(msg, 409, code); }
}
