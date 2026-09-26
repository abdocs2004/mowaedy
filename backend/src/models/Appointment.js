import mongoose from 'mongoose';
import { STATUS_VALUES, APPOINTMENT_STATUS } from '../config/constants.js';

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    status: { type: String, enum: STATUS_VALUES, default: APPOINTMENT_STATUS.PENDING, index: true },

    /** Snapshots so history stays correct if the service is edited later. */
    serviceName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true },

    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true, default: '' },
    },
    notes: { type: String, trim: true, default: '', maxlength: 500 },

    cancelledBy: { type: String, enum: ['user', 'provider', 'admin'] },
    cancelledAt: { type: Date },
    cancelReason: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

appointmentSchema.index({ provider: 1, startAt: 1 });
appointmentSchema.index({ user: 1, startAt: -1 });
appointmentSchema.index({ startAt: -1 });

appointmentSchema.set('toJSON', { transform: (_d, r) => { delete r.__v; return r; } });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
