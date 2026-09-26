import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changePasswordBody, loginBody, registerBody, updateProfileBody } from '../validators/auth.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'محاولات كثيرة، يرجى المحاولة بعد قليل' },
});

const router = Router();
router.post('/register', limiter, validate({ body: registerBody }), ctrl.register);
router.post('/login', limiter, validate({ body: loginBody }), ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', protect, ctrl.me);
router.patch('/me', protect, validate({ body: updateProfileBody }), ctrl.updateProfile);
router.patch('/password', protect, limiter, validate({ body: changePasswordBody }), ctrl.changePassword);
export default router;
