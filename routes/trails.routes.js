import { Router } from 'express';
import {
	getAllTrails,
	getTrail,
	createTrail,
	updateTrail,
	deleteTrail,
	getAllNearByTrails,
	getAllParks,
	toggleFavouriteTrail,
	getUserFavouriteTrails,
	fetchTrailsStatistics,
	getTrailBySlug,
	getDashboardStats,
	// deleteManyTrails,
} from '../controllers/trail.controller';
import {
	validate,
	isAuth,
	uploadMiddleware,
	optionalAuth,
	authorize,
} from '../middlewares';
import {
	getTrailSchema,
	addTrailSchema,
	TrailIdSchema,
	updateTrailSchema,
	getAllNearByTrailSchema,
	getAllParkSchema,
	toggleFavouriteTrailSchema,
	TrailSlugSchema,
	// deleteTrailsSchema,
} from '../validations/trails.validations';
import { parseJsonFields } from '../utils/parseToJson';
// import { upload } from '../middlewares/multer.middlewares';
// import { upload } from '../middlewares/multer.middlewares';

const router = Router();
router.get(
	'/getDashboardStats',
	isAuth,
	authorize(['ADMIN']),
	getDashboardStats,
);
router.get('/fetchTrailsStatistics', isAuth, fetchTrailsStatistics);
router.get('/getUserFavouriteTrails', isAuth, getUserFavouriteTrails);
router.put(
	'/toggleFavouriteTrail',
	isAuth,
	validate(toggleFavouriteTrailSchema),
	toggleFavouriteTrail,
);

router.get(
	'/getAllParks',
	optionalAuth,
	validate(getAllParkSchema),
	getAllParks,
);
router.get(
	'/getAllNearByTrails',
	optionalAuth,
	validate(getAllNearByTrailSchema),
	getAllNearByTrails,
);
router.get('/:id', optionalAuth, validate(TrailIdSchema), getTrail);
router.get(
	'/fetchTrailBySlug/:slug',
	optionalAuth,
	validate(TrailSlugSchema),
	getTrailBySlug,
);
router.post(
	'/',
	isAuth,
	// upload.array('files'),
	uploadMiddleware,
	parseJsonFields(['activities', 'trailInfo']), // 👈 Here
	validate(addTrailSchema),
	createTrail,
);
router.get('/', optionalAuth, validate(getTrailSchema), getAllTrails);
router.put(
	'/:id',
	isAuth,
	// upload.single('file'),
	uploadMiddleware,
	validate(updateTrailSchema),
	updateTrail,
);
router.delete('/:id', isAuth, validate(TrailIdSchema), deleteTrail);

export const TrailRoutes = router;
