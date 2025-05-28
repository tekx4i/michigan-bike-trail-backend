import { Router } from 'express';

import {
	getAllTrailAssociationss,
	getTrailAssociations,
	createTrailAssociations,
	updateTrailAssociations,
	deleteTrailAssociations,
	deleteManyTrailAssociations,
} from '../controllers';
import { validate, isAuth, uploadMiddleware, authorize } from '../middlewares';
import {
	getTrailAssociationsSchema,
	addTrailAssociationsSchema,
	TrailAssociationsIdSchema,
	updateTrailAssociationsSchema,
	deleteTrailAssociationssSchema,
} from '../validations';

const router = Router();

router.get(
	'/',
	// isAuth,
	// authorize(["ADMIN"]),
	validate(getTrailAssociationsSchema),
	getAllTrailAssociationss,
);
router.get(
	'/:id',
	isAuth,
	validate(TrailAssociationsIdSchema),
	getTrailAssociations,
);
router.post(
	'/add',
	isAuth,
	authorize(['ADMIN']),
	uploadMiddleware,
	validate(addTrailAssociationsSchema),
	createTrailAssociations,
);
router.put(
	'/:id',
	isAuth,
	authorize(['ADMIN']),
	uploadMiddleware,
	validate(updateTrailAssociationsSchema),
	updateTrailAssociations,
);
router.delete(
	'/:id',
	isAuth,
	authorize(['ADMIN']),
	validate(TrailAssociationsIdSchema),
	deleteTrailAssociations,
);
router.delete(
	'/',
	isAuth,
	authorize(['ADMIN']),
	validate(deleteTrailAssociationssSchema),
	deleteManyTrailAssociations,
);

export const TrailAssociationsRoutes = router;
