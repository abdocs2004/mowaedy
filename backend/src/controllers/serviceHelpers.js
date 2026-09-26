import { Appointment } from '../models/Appointment.js';
import { Service } from '../models/Service.js';
import { AppError } from '../utils/AppError.js';

/** Deletes a service, or deactivates it when appointments reference it (keeps history intact). */
export async function removeOrDeactivateService(service) {
  const used = await Appointment.exists({ service: service._id });
  if (used) {
    service.isActive = false;
    await service.save();
    return { deleted: false, message: 'الخدمة مرتبطة بمواعيد سابقة، تم تعطيلها بدلاً من حذفها' };
  }
  await Service.deleteOne({ _id: service._id });
  return { deleted: true, message: 'تم حذف الخدمة' };
}

/** Service durations must fit the provider's slot grid, otherwise slots would be misaligned. */
export function assertDurationFitsGrid(durationMinutes, slotMinutes) {
  if (durationMinutes % slotMinutes !== 0) {
    throw AppError.badRequest(`مدة الخدمة يجب أن تكون من مضاعفات ${slotMinutes} دقيقة (مدة الفترة الزمنية لمقدم الخدمة)`);
  }
}
