import { Router } from 'express';
import * as ctrl from '../controllers/providerController.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { availabilityQuery, listProvidersQuery, slotsQuery } from '../validators/provider.js';

const router = Router();
router.get('/', validate({ query: listProvidersQuery }), ctrl.listProviders);
router.get('/locations', ctrl.listLocations);
router.get('/:id', validate({ params: idParams }), ctrl.getProvider);
router.get('/:id/slots', validate({ params: idParams, query: slotsQuery }), ctrl.getSlots);
router.get('/:id/availability', validate({ params: idParams, query: availabilityQuery }), ctrl.getProviderAvailability);
export default router;
