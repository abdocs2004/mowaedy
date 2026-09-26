import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/contactController.js';
import { validate } from '../middleware/validate.js';
import { contactBody } from '../validators/contact.js';

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'لقد أرسلت رسائل كثيرة، حاول مرة أخرى لاحقاً' },
});

const router = Router();
router.post('/', limiter, validate({ body: contactBody }), ctrl.sendMessage);
export default router;
