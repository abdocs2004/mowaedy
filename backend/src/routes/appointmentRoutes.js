import { Router } from 'express';
import * as ctrl from '../controllers/appointmentController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { cancelBody, createAppointmentBody, myAppointmentsQuery } from '../validators/appointment.js';

const router = Router();
router.use(protect);

router.post('/', restrictTo('user', 'admin'), validate({ body: createAppointmentBody }), ctrl.createAppointment);
router.get('/mine', validate({ query: myAppointmentsQuery }), ctrl.listMyAppointments);
router.get('/:id', validate({ params: idParams }), ctrl.getAppointment);
router.patch('/:id/cancel', validate({ params: idParams, body: cancelBody }), ctrl.cancelMyAppointment);
export default router;
