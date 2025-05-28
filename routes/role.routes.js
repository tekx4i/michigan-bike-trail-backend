import { Router } from 'express';

import {
	getAllRoles,
	getRole,
	createRole,
	updateRole,
	deleteRole,
	deleteManyRole,
} from '../controllers';
import { validate, isAuth } from '../middlewares';
import {
	getRoleSchema,
	addRoleSchema,
	RoleIdSchema,
	updateRoleSchema,
	deleteRolesSchema,
} from '../validations';

const router = Router();

router.get('/', isAuth, validate(getRoleSchema), getAllRoles);
router.get('/:id', isAuth, validate(RoleIdSchema), getRole);
router.post('/', isAuth, validate(addRoleSchema), createRole);
router.put('/:id', isAuth, validate(updateRoleSchema), updateRole);
router.delete('/:id', isAuth, validate(RoleIdSchema), deleteRole);
router.delete('/', isAuth, validate(deleteRolesSchema), deleteManyRole);

export const RoleRoutes = router;
