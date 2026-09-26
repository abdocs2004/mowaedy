import mongoose from 'mongoose';

/** Provider categories (gym / barber / clinic). New categories can be added by an admin. */
const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
    /** Singular label used on provider cards, e.g. "صالة رياضية". */
    singularAr: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    icon: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.set('toJSON', { transform: (_d, r) => { delete r.__v; return r; } });

export const Category = mongoose.model('Category', categorySchema);
