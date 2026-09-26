import mongoose from 'mongoose';

/** Messages sent from the landing-page contact form (replaces the old EmailJS call). */
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, trim: true, default: '', maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.set('toJSON', { transform: (_d, r) => { delete r.__v; return r; } });

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
