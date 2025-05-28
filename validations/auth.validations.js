import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INVALID_EMAIL,
	PASSWORD_MIN_LENGTH,
	EMAIL_EXISTS,
	REQUIRED_FIELDS,
	GENDERS,
	INVALID_DATE_FORMAT,
	INVALID_GENDER,
	ALL_ROLES,
	ALL_STATUS,
	INVALID_ROLE,
	USER_NOT_FOUND,
	INVALID_STATUS,
	GET_USER_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const loginSchema = yup.object().shape({
	body: yup.object().shape({
		email: yup.string().email(INVALID_EMAIL).required(),
		password: yup
			.string()
			.required(REQUIRED_FIELDS)
			.min(6, PASSWORD_MIN_LENGTH),
		role: yup
			.number()
			.notRequired()
			.test({
				name: 'valid-form',
				message: INVALID_ROLE,
				async test(value) {
					if (!value) return true;
					const record = await prisma.roles.findFirst({
						where: {
							deleted: false,
							id: value,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const getUsersSchema = yup.object({
	query: createQueryParamsSchema(GET_USER_QUERY_SCHEMA_CONFIG),
});

export const registerSchema = yup.object({
	body: yup.object({
		// name: yup.string().required(REQUIRED_FIELDS),
		firstName: yup.string().required(REQUIRED_FIELDS),
		lastName: yup.string().required(REQUIRED_FIELDS),
		number: yup.string().notRequired(),
		email: yup
			.string()
			.email(INVALID_EMAIL)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: EMAIL_EXISTS,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							email: value,
						},
					});

					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		password: yup.string().notRequired().min(6),
		birth_date: yup
			.string()
			.notRequired()
			.matches(/^\d{4}-\d{2}-\d{2}$/, INVALID_DATE_FORMAT),
		gender: yup.string().notRequired(),
		role_id: yup
			.number()
			.notRequired()
			.default(2) // update later on
			.test({
				name: 'valid-form',
				message: INVALID_ROLE,
				async test(value) {
					// if (value === 1) return Boolean(0);
					if (!value) return Boolean(1);

					const record = await prisma.roles.findFirst({
						where: {
							deleted: false,
							id: value,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		address: yup.string().notRequired(),
		city: yup.string().notRequired(),
		state: yup.string().notRequired(),
		country: yup.string().notRequired(),
	}),
});

export const brandRegisterSchema = yup.object({
	body: yup.object({
		name: yup.string().required(REQUIRED_FIELDS),
		number: yup.string().notRequired(),
		email: yup
			.string()
			.email(INVALID_EMAIL)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: EMAIL_EXISTS,
				async test(value) {
					const record = await prisma.users.findUnique({
						where: {
							deleted: false,
							email: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		role: yup.string().required(REQUIRED_FIELDS).oneOf(ALL_ROLES, INVALID_ROLE),
		address: yup.string().notRequired(),
		city: yup.string().notRequired(),
		state: yup.string().notRequired(),
		country: yup.string().notRequired(),
	}),
});

export const verifySchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
							status: {
								not: 'BLOCKED',
							},
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	body: yup.object({
		otp: yup.string().min(4).max(4).required(REQUIRED_FIELDS),
	}),
});

export const userIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const resendOTPSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	query: yup.object({
		type: yup.string().notRequired(),
	}),
});

export const updateUserSchema = yup.object({
	body: yup.object({
		// name: yup.string().notRequired(),
		number: yup.string().notRequired(),
		// password: yup.string().notRequired().min(6),
		// birth_date: yup
		// 	.string()
		// 	.notRequired()
		// 	.matches(/^\d{4}-\d{2}-\d{2}$/, INVALID_DATE_FORMAT),
		birth_date: yup
			.date() // Enforces a proper Date type
			.notRequired()
			.transform((value, originalValue) => {
				return originalValue ? new Date(originalValue) : null;
			})
			.typeError(INVALID_DATE_FORMAT),
		gender: yup.string().notRequired().oneOf(GENDERS, INVALID_GENDER),
		status: yup.string().notRequired().oneOf(ALL_STATUS, INVALID_STATUS),
		address: yup.string().notRequired(),
		password: yup.string().notRequired().min(6),
		city: yup.string().notRequired(),
		state: yup.string().notRequired(),
		country: yup.string().notRequired(),
		language: yup.string().notRequired(), // add enum later on
		// email: yup.string().notRequired().email(INVALID_EMAIL),
		firstName: yup.string().notRequired(),
		lastName: yup.string().notRequired(),
		aboutMe: yup.string().notRequired(),
		units: yup.string().notRequired(),

		// Validate userFavoriteActivities
		userFavoriteActivities: yup
			.object({
				backpacking: yup.boolean().notRequired(),
				cross_country_skiing: yup.boolean().notRequired(),
				horseback_riding: yup.boolean().notRequired(),
				snowshoeing: yup.boolean().notRequired(),
				mountain_biking: yup.boolean().notRequired(),
				skiing: yup.boolean().notRequired(),
				fishing: yup.boolean().notRequired(),
				running: yup.boolean().notRequired(),
				hiking: yup.boolean().notRequired(),
				birding: yup.boolean().notRequired(),
				camping: yup.boolean().notRequired(),
				scenic_driving: yup.boolean().notRequired(),
				off_road_driving: yup.boolean().notRequired(),
				via_ferrata: yup.boolean().notRequired(),
				rock_climbing: yup.boolean().notRequired(),
				road_biking: yup.boolean().notRequired(),
				walking: yup.boolean().notRequired(),
				bike_touring: yup.boolean().notRequired(),
			})
			.notRequired(),
	}),
	file: yup.mixed().notRequired(),
	files: yup.mixed().notRequired(),
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.optional(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					// Only run the test if the value is provided (not undefined or null)
					if (value === undefined || value === null) {
						return true; // If no value is provided, skip this test
					}
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});
export const updateLoginUserSchema = yup.object({
	body: yup.object({
		name: yup.string().notRequired(),
		number: yup.string().notRequired(),
		// password: yup.string().notRequired().min(6),
		// birth_date: yup
		// 	.string()
		// 	.notRequired()
		// 	.matches(/^\d{4}-\d{2}-\d{2}$/, INVALID_DATE_FORMAT),
		birth_date: yup
			.date() // Enforces a proper Date type
			.notRequired()
			.transform((value, originalValue) => {
				return originalValue ? new Date(originalValue) : null;
			})
			.typeError(INVALID_DATE_FORMAT),
		gender: yup.string().notRequired().oneOf(GENDERS, INVALID_GENDER),
		status: yup.string().notRequired().oneOf(ALL_STATUS, INVALID_STATUS),
		address: yup.string().notRequired(),
		city: yup.string().notRequired(),
		state: yup.string().notRequired(),
		country: yup.string().notRequired(),
		// Validate userFavoriteActivities
		userFavoriteActivities: yup
			.object({
				backpacking: yup.boolean().notRequired(),
				cross_country_skiing: yup.boolean().notRequired(),
				horseback_riding: yup.boolean().notRequired(),
				snowshoeing: yup.boolean().notRequired(),
				mountain_biking: yup.boolean().notRequired(),
				skiing: yup.boolean().notRequired(),
				fishing: yup.boolean().notRequired(),
				running: yup.boolean().notRequired(),
				hiking: yup.boolean().notRequired(),
				birding: yup.boolean().notRequired(),
				camping: yup.boolean().notRequired(),
				scenic_driving: yup.boolean().notRequired(),
				off_road_driving: yup.boolean().notRequired(),
				via_ferrata: yup.boolean().notRequired(),
				rock_climbing: yup.boolean().notRequired(),
				road_biking: yup.boolean().notRequired(),
				walking: yup.boolean().notRequired(),
				bike_touring: yup.boolean().notRequired(),
			})
			.notRequired(),
	}),
});

export const updateManyUserSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
		status: yup
			.string()
			.required(REQUIRED_FIELDS)
			.oneOf(ALL_STATUS, INVALID_STATUS),
	}),
});

export const forgotSchema = yup.object({
	body: yup.object({
		email: yup
			.string()
			.email(INVALID_EMAIL)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							email: value,
							status: {
								not: 'BLOCKED',
							},
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const resetSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
							status: {
								not: 'BLOCKED',
							},
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	body: yup.object({
		password: yup.string().required(REQUIRED_FIELDS).min(6),
	}),
});

export const changePasswordSchema = yup.object({
	body: yup.object({
		oldPassword: yup.string().required(REQUIRED_FIELDS),
		newPassword: yup.string().required(REQUIRED_FIELDS).min(6),
	}),
});


export const deleteUsersSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
