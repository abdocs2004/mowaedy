import mongoose from 'mongoose';

/**
 * Double-booking guard. One document per slot "cell" (`<providerId>:<slotStartMs>`) occupied by an
 * active appointment. The unique index on `key` makes the database itself reject a second booking
 * of the same cell — even when two requests arrive at the same instant.
 * Locks are deleted when the appointment is cancelled/completed.
 */
const slotLockSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
  },
  { versionKey: false }
);

export const SlotLock = mongoose.model('SlotLock', slotLockSchema);
