import { Router } from 'express';

import {
	getAllUsers,
	getUser,
	createUser,
	updateUser,
	updateManyUser,
	deleteUser,
	deleteManyUser,
} from '../controllers';
import { validate, isAuth, uploadMiddleware, authorize } from '../middlewares';
import {
	getUsersSchema,
	registerSchema,
	userIdSchema,
	updateUserSchema,
	deleteUsersSchema,
	updateManyUserSchema,
	updateLoginUserSchema,
} from '../validations';

const router = Router();

// Now worked, If needed utilize
// token user route pending
// router.put('/update-profile', isAuth, validate(updateLoginUserSchema), updateUser);
router.put(
	'/update-profile',
	isAuth,
	uploadMiddleware,
	validate(updateUserSchema),
	updateUser,
);

router.get(
	'/',
	isAuth,
	authorize(['ADMIN']),
	validate(getUsersSchema),
	getAllUsers,
);
// admin routes
router.get('/:id', isAuth, validate(userIdSchema), getUser);
router.post(
	'/',
	isAuth,
	authorize(['ADMIN']),
	validate(registerSchema),
	createUser,
);
// router.put('/:id', isAuth, upload.single("file"), validate(updateUserSchema), updateUser);
router.put(
	'/:id',
	isAuth,
	uploadMiddleware,
	validate(updateUserSchema),
	updateUser,
);
router.put('/', isAuth, validate(updateManyUserSchema), updateManyUser);
router.delete('/:id', isAuth, validate(userIdSchema), deleteUser);
router.delete('/', isAuth, validate(deleteUsersSchema), deleteManyUser);

export const UserRoutes = router;
