import { ContactMessage } from '../models/ContactMessage.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, pageMeta } from '../utils/pagination.js';

export const sendMessage = asyncHandler(async (req, res) => {
  await ContactMessage.create(req.body);
  res.status(201).json({ message: 'تم إرسال رسالتك بنجاح، سنرد عليك قريباً' });
});

export const listMessages = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const filter = req.query.isRead === undefined ? {} : { isRead: req.query.isRead };
  const [total, data, unread] = await Promise.all([
    ContactMessage.countDocuments(filter),
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit),
    ContactMessage.countDocuments({ isRead: false }),
  ]);
  res.json({ data, meta: { ...pageMeta(total, pg), unread } });
});

export const markMessage = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: req.body.isRead }, { new: true });
  if (!msg) throw AppError.notFound('الرسالة غير موجودة');
  res.json({ data: msg });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!msg) throw AppError.notFound('الرسالة غير موجودة');
  res.json({ message: 'تم حذف الرسالة' });
});
