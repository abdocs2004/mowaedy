import mongoose from 'mongoose';

const timeString = {
  type: String,
  match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'صيغة الوقت غير صحيحة (HH:mm)'],
};

const workingDaySchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
    isOpen: { type: Boolean, default: true },
    start: { ...timeString, default: '10:00' },
    end: { ...timeString, default: '18:00' },
    breaks: {
      type: [new mongoose.Schema({ start: timeString, end: timeString }, { _id: false })],
      default: [],
    },
  },
  { _id: false }
);

const providerSchema = new mongoose.Schema(
  {
    /** The user account that manages this provider (role = provider). */
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },

    name: { type: String, required: true, trim: true, maxlength: 100 },
    /** Salon / clinic / gym name shown under the provider name. */
    businessName: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '', maxlength: 1500 },
    image: { type: String, default: '' },
    gallery: { type: [String], default: [] },

    city: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    whatsapp: { type: String, trim: true, default: '' },

    workingHours: { type: [workingDaySchema], default: [] },
    slotMinutes: { type: Number, default: 30, min: 5, max: 240 },
    minNoticeMinutes: { type: Number, default: 60, min: 0 },
    maxAdvanceDays: { type: Number, default: 30, min: 1, max: 365 },
    /** true = bookings are confirmed instantly, false = provider must confirm. */
    autoConfirm: { type: Boolean, default: false },

    /** Category-specific fields (gym: specialties…, barber: experienceYears…, clinic: specialty…). */
    categoryData: { type: mongoose.Schema.Types.Mixed, default: {} },

    /** Reserved for a future Review model; kept denormalised for fast listing. */
    rating: {
      avg: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

providerSchema.index({ name: 1 });
providerSchema.index({ city: 1 });

providerSchema.set('toJSON', { transform: (_d, r) => { delete r.__v; return r; } });

export const Provider = mongoose.model('Provider', providerSchema);
