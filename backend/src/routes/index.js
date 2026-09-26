import { Router } from 'express';
import adminRoutes from './adminRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import contactRoutes from './contactRoutes.js';
import portalRoutes from './portalRoutes.js';
import providerRoutes from './providerRoutes.js';

const router = Router();
router.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/contact', contactRoutes);
router.use('/providers', providerRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/provider', portalRoutes);
router.use('/admin', adminRoutes);
export default router;
