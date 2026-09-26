import { Router } from 'express';
import * as ctrl from '../controllers/adminController.js';
import * as contact from '../controllers/contactController.js';
import { listMessagesQuery, readBody } from '../validators/contact.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { adminCreateUserBody, adminListUsersQuery, adminUpdateUserBody } from '../validators/admin.js';
import { manageAppointmentsQuery, statusBody } from '../validators/appointment.js';
import {
  adminCreateProviderBody, adminCreateServiceBody, adminListProvidersQuery, adminListServicesQuery,
  adminUpdateProviderBody, updateServiceBody,
} from '../validators/provider.js';

/** /api/admin — every route requires an authenticated admin. */
const router = Router();
router.use(protect, restrictTo('admin'));

router.get('/stats', ctrl.stats);

router.get('/messages', validate({ query: listMessagesQuery }), contact.listMessages);
router.patch('/messages/:id', validate({ params: idParams, body: readBody }), contact.markMessage);
router.delete('/messages/:id', validate({ params: idParams }), contact.deleteMessage);

router.get('/users', validate({ query: adminListUsersQuery }), ctrl.listUsers);
router.post('/users', validate({ body: adminCreateUserBody }), ctrl.createUser);
router.get('/users/:id', validate({ params: idParams }), ctrl.getUser);
router.patch('/users/:id', validate({ params: idParams, body: adminUpdateUserBody }), ctrl.updateUser);
router.delete('/users/:id', validate({ params: idParams }), ctrl.deleteUser);

router.get('/providers', validate({ query: adminListProvidersQuery }), ctrl.listProviders);
router.post('/providers', validate({ body: adminCreateProviderBody }), ctrl.createProvider);
router.get('/providers/:id', validate({ params: idParams }), ctrl.getProvider);
router.patch('/providers/:id', validate({ params: idParams, body: adminUpdateProviderBody }), ctrl.updateProvider);
router.delete('/providers/:id', validate({ params: idParams }), ctrl.deleteProvider);

router.get('/services', validate({ query: adminListServicesQuery }), ctrl.listServices);
router.post('/services', validate({ body: adminCreateServiceBody }), ctrl.createService);
router.patch('/services/:id', validate({ params: idParams, body: updateServiceBody }), ctrl.updateService);
router.delete('/services/:id', validate({ params: idParams }), ctrl.deleteService);

router.get('/appointments', validate({ query: manageAppointmentsQuery }), ctrl.listAppointments);
router.get('/appointments/:id', validate({ params: idParams }), ctrl.getAppointment);
router.patch('/appointments/:id/status', validate({ params: idParams, body: statusBody }), ctrl.updateAppointmentStatus);
export default router;
