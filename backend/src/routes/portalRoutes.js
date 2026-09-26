import { Router } from 'express';
import * as ctrl from '../controllers/portalController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { manageAppointmentsQuery, statusBody } from '../validators/appointment.js';
import { createServiceBody, updateOwnProviderBody, updateServiceBody } from '../validators/provider.js';

/** /api/provider — the logged-in provider's own dashboard API. */
const router = Router();
router.use(protect, restrictTo('provider'), ctrl.loadOwnProvider);

router.get('/me', ctrl.getOwnProfile);
router.patch('/me', validate({ body: updateOwnProviderBody }), ctrl.updateOwnProfile);
router.get('/stats', ctrl.getOwnStats);

router.get('/services', ctrl.listOwnServices);
router.post('/services', validate({ body: createServiceBody }), ctrl.createOwnService);
router.patch('/services/:id', validate({ params: idParams, body: updateServiceBody }), ctrl.updateOwnService);
router.delete('/services/:id', validate({ params: idParams }), ctrl.deleteOwnService);

router.get('/appointments', validate({ query: manageAppointmentsQuery }), ctrl.listOwnAppointments);
router.patch('/appointments/:id/status', validate({ params: idParams, body: statusBody }), ctrl.updateOwnAppointmentStatus);
export default router;
