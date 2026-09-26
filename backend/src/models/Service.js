import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, default: '', maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.set('toJSON', { transform: (_d, r) => { delete r.__v; return r; } });

export const Service = mongoose.model('Service', serviceSchema);
