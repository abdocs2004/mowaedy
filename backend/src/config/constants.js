export const ROLES = Object.freeze({ USER: 'user', PROVIDER: 'provider', ADMIN: 'admin' });
export const ROLE_VALUES = Object.values(ROLES);

export const APPOINTMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});
export const STATUS_VALUES = Object.values(APPOINTMENT_STATUS);
/** Statuses that occupy a time slot. */
export const ACTIVE_STATUSES = [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED];

/** Allowed status transitions for provider/admin. */
export const STATUS_TRANSITIONS = Object.freeze({
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
});

export const STATUS_LABELS_AR = Object.freeze({
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
});

/** Day index follows JS Date#getDay(): 0 = Sunday … 6 = Saturday. */
export const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
