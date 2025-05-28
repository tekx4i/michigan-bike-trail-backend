import { Router } from 'express';

import {
	getAllRatings,
	getRating,
	// createRating,
	// updateRating,
	deleteRating,
	deleteManyRating,
	createOrUpdateRating,
} from '../controllers';
import {
	validate,
	isAuth,
	uploadMiddleware,
	optionalAuth,
} from '../middlewares';
import {
	getRatingSchema,
	addRatingSchema,
	RatingIdSchema,
	updateRatingSchema,
	deleteRatingsSchema,
} from '../validations';

const router = Router();

router.get('/', optionalAuth, validate(getRatingSchema), getAllRatings);
// router.get('/:id', isAuth, validate(RatingIdSchema), getRating);

// router.post(
// 	'/',
// 	isAuth,
// 	upload.single('file'),
// 	validate(addRatingSchema),
// 	createOrUpdateRating,
// );
router.post(
	'/',
	isAuth,
	// upload.array('files', 5), // Allow up to 5 images
	uploadMiddleware,
	validate(addRatingSchema),
	createOrUpdateRating,
);

// router.put(
// 	'/:id',
// 	isAuth,
// 	upload.single('file'),
// 	validate(updateRatingSchema),
// 	updateRating,
// );
router.delete('/:id', isAuth, validate(RatingIdSchema), deleteRating);
router.delete('/', isAuth, validate(deleteRatingsSchema), deleteManyRating);

export const RatingRoutes = router;
