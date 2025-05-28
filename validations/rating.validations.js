import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INTEGER_ERROR,
	REQUIRED_FIELDS,
	INVALID_RATING_ID,
	RATING_ALREADY_EXIST,
	GET_RATING_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';
import { query } from 'express';

const prisma = new PrismaClient();

export const getRatingSchema = yup.object({
	query: createQueryParamsSchema(GET_RATING_QUERY_SCHEMA_CONFIG),
});

// export const addRatingSchema = yup.object({
// 	body: yup.object({
// 		title: yup.string().required(REQUIRED_FIELDS),
// 		description: yup.string().notRequired(),
// 		rating: yup.number().required(REQUIRED_FIELDS),
// 		trail_id: yup.number().required(REQUIRED_FIELDS),
// 	}),
// 	file: yup.mixed().notRequired(),
// });

export const addRatingSchema = yup.object({
	body: yup.object({
		// title: yup.string().required(REQUIRED_FIELDS),
		description: yup.string().notRequired(),
		rating: yup.number().required(REQUIRED_FIELDS).min(1).max(5),
		trail_id: yup.number().required(REQUIRED_FIELDS),
		experience: yup.string().notRequired(),
		difficulty: yup.string().notRequired(),
		parkingLotSize: yup.number().notRequired().min(1),
		parkingCost: yup.string().notRequired(),
		// access: yup.string().oneOf(["ENTRY_FEE", "PERMIT_REQUIRED"]).notRequired(),
		access: yup.string().notRequired(),
		// entryFee: yup.number().notRequired().min(0),
		condition: yup.string().notRequired(),
		activityType: yup.string().notRequired(),
		dateVisited: yup.date().notRequired(),
		images: yup.array().of(yup.string().url()).notRequired(), // Expecting an array of image URLs
	}),
	files: yup.array().of(yup.mixed()).notRequired(), // Handles multiple file uploads
});

// export const updateRatingSchema = yup.object({
// 	body: yup.object({
// 		title: yup.string().notRequired(),
// 		description: yup.string().notRequired(),
// 		rating: yup.number().notRequired(),
// 		trail_id: yup.number().notRequired(),
// 	}),
// 	file: yup.mixed().notRequired(),
// 	params: yup.object({
// 		id: yup
// 			.number()
// 			.positive()
// 			.integer(INTEGER_ERROR)
// 			.required(REQUIRED_FIELDS)
// 			.test({
// 				name: 'valid-form',
// 				message: INVALID_RATING_ID,
// 				async test(value) {
// 					const record = await prisma.rating.findUnique({
// 						where: {
// 							deleted: false,
// 							id: parseInt(value, 10),
// 						},
// 					});
// 					return !record || !record.id ? Boolean(0) : Boolean(1);
// 				},
// 			}),
// 	}),
// });

export const updateRatingSchema = yup.object({
	body: yup.object({
		title: yup.string().required(REQUIRED_FIELDS),
		description: yup.string().notRequired(),
		rating: yup.number().required(REQUIRED_FIELDS).min(1).max(5),
		trail_id: yup.number().required(REQUIRED_FIELDS),
		experience: yup.number().required(REQUIRED_FIELDS).min(1).max(5),
		difficulty: yup.number().required(REQUIRED_FIELDS).min(1).max(5),
		parkingLotSize: yup.number().notRequired().min(1),
		parkingCost: yup.number().notRequired().min(0),
		access: yup
			.string()
			.oneOf(['REQUIRED', 'NOT_REQUIRED', 'RECOMMENDED'])
			.notRequired(),
		entryFee: yup.number().notRequired().min(0),
		condition: yup.string().notRequired(),
		activityType: yup.string().notRequired(),
		dateVisited: yup.date().required(REQUIRED_FIELDS),
		images: yup.array().of(yup.string().url()).notRequired(), // Expecting an array of image URLs
	}),
	files: yup.array().of(yup.mixed()).notRequired(), // Handles multiple file uploads
});

export const RatingIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_RATING_ID,
				async test(value) {
					const record = await prisma.rating.findMany({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record.length ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const deleteRatingsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
