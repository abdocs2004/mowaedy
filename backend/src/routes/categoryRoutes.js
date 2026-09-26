import { Router } from 'express';
import * as ctrl from '../controllers/categoryController.js';
import { optionalAuth, protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { categoryBody, categoryUpdateBody } from '../validators/provider.js';

const router = Router();
router.get('/', optionalAuth, ctrl.listCategories);
router.post('/', protect, restrictTo('admin'), validate({ body: categoryBody }), ctrl.createCategory);
router.patch('/:id', protect, restrictTo('admin'), validate({ params: idParams, body: categoryUpdateBody }), ctrl.updateCategory);
router.delete('/:id', protect, restrictTo('admin'), validate({ params: idParams }), ctrl.deleteCategory);
export default router;
