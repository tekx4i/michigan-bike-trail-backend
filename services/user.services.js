import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status-codes';

import { USER_NOT_FOUND, ACCOUNT_STATUS } from '../constants';
import { AppError } from '../errors';
import { generateRandomString } from '../utils';

const prisma = new PrismaClient();

export class UserService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllUsers() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, role, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
				role_id: {
					not: 1,
				},
			},
		};
		if (role) {
			const findRole = await prisma.roles.findFirst({
				where: {
					name: role,
				},
			});
			if (!findRole) {
				throw new AppError('Role not found', HttpStatus.OK);
			}
			options.where.role_id = findRole.id;
		}
		if (search) {
			options.where.AND = Object.keys(search).map(key => ({
				[key]: { contains: search[key] },
			}));
		}
		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.users.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.select = {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			number: true,
			// image: true,
			original_name: true,
			status: true,
			deleted: true,
			created_at: true,
			updated_at: true,
			// createdTrails: true,
			_count: {
				select: {
					createdTrails: true,
				},
			},
			role: {
				select: {
					id: true,
					name: true,
				},
			},
		};
		let allRecords = await prisma.users.findMany(options);

		// console.log('allRecords', allRecords);
		// Issue
		// const allRecords = await prisma.users.findMany({...options, include: { UserFavoriteActivities: true }});

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		// allRecords = allRecords.map(record => {
		// 	const birthDate = record.birth_date;
		// 	console.log('birthDate', birthDate);
		// 	if (birthDate) {
		// 		const age =
		// 			new Date().getFullYear() - new Date(birthDate).getFullYear();
		// 		record.age = age;
		// 	}
		// 	return record;
		// });

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getUser() {
		const { id } = this.req.params;
		const record = await prisma.users.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			include: {
				UserFavoriteActivities: true,
				role: true,
			},
		});
		// if (!record || !record.id)
		// 	throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
		// // calculate age
		// if (record.birth_date) {
		// 	const age =
		// 		new Date().getFullYear() - new Date(record.birth_date).getFullYear();
		// 	record.age = age;
		// }
		return this.publicProfile(record);
	}

	async createUser() {
		const { body, user } = this.req;
		let { password } = body;

		let fetchUser = await prisma.users.findFirst({
			where: {
				email: body.email,
				// deleted: false,
			},
		});
		if (fetchUser?.deleted) {
			await prisma.users.update({
				where: {
					id: fetchUser.id,
				},
				data: {
					deleted: false,
					status: ACCOUNT_STATUS.ACTIVE,
				},
			});

			fetchUser = await prisma.users.findUnique({
				where: {
					deleted: false,
					id: fetchUser.id,
				},
			});

			return this.publicProfile(fetchUser);
		}

		const birthDate = body.birth_date;

		if (!password) {
			password = generateRandomString(6, 20);
		}

		body.password = await bcrypt.hash(password, 12);
		if (birthDate) {
			body.birth_date = new Date(`${birthDate}T00:00:00.000Z`);
		}
		body.status = ACCOUNT_STATUS.ACTIVE;

		body.created_by = user.id;

		const newUser = await prisma.users.create({ data: body });

		return this.publicProfile(newUser);
	}

	async updateUser() {
		const { userFavoriteActivities, birthDate, password, ...otherBody } =
			this.body;

		const userId = this.req.params?.id ? this.req.params.id : this.req.user.id;

		if (this.req?.user?.role?.name === 'ADMIN' && password) {
			const passwordHash = await bcrypt.hash(password, 12);

			const updateRecord = await prisma.users.update({
				where: {
					id: parseInt(userId, 10),
				},
				data: {
					password: passwordHash,
					remember_token: null,
				},
			});
		}

		if (birthDate) {
			body.birth_date = new Date(`${birthDate}T00:00:00.000Z`);
		}
		// const file = this.req.files?.file ? this.req.files.file[0] : null;
		const files = this.req.files?.files || [];

		if (files.length > 0) {
			otherBody.file_name = files[0].filename;
			otherBody.original_name = files[0].originalname;
			// otherBody.file_name = this.req.file.filename;
			// otherBody.original_name = this.req.file.originalname;
		}
		const updateRecord = await prisma.users.update({
			where: {
				deleted: false,
				id: parseInt(userId, 10),
			},
			data: otherBody,
		});

		if (
			userFavoriteActivities &&
			Object.keys(userFavoriteActivities).length > 0
		) {
			const updatedUserFavoriteActivities =
				await prisma.userFavoriteActivities.update({
					where: { user_id: userId },
					data: userFavoriteActivities, // Update the specific activities
				});
		}

		// fetch updated user
		const updatedUser = await prisma.users.findUnique({
			where: {
				deleted: false,
				id: parseInt(userId, 10),
			},
			include: {
				UserFavoriteActivities: true,
				role: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
		return this.publicProfile(updatedUser);

		// return this.publicProfile(updateRecord);
	}

	async updateManyUser() {
		const { ids, status } = this.req.body;

		const updateRecord = await prisma.users.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				status,
			},
		});

		return updateRecord;
	}

	async deleteUser() {
		const { id } = this.req.params;

		await prisma.users.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				deleted: true,
				status: ACCOUNT_STATUS.DELETED,
			},
		});

		return null;
	}

	async deleteManyUser() {
		const { ids } = this.req.body;

		await prisma.users.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				deleted: true,
			},
		});

		return null;
	}

	/* eslint-disable-next-line class-methods-use-this */
	publicProfile(user) {
		const record = { ...user };
		if (!record || !record.id)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		if (record.password) delete record.password;
		if (record.remember_token) delete record.remember_token;

		return record;
	}
}
