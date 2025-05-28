import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INTEGER_ERROR,
	REQUIRED_FIELDS,
	INVALID_TRAIL_ID,
	TRAIL_ALREADY_EXIST,
	GET_TRAIL_QUERY_SCHEMA_CONFIG,
	GET_NEAR_BY_TRAIL_QUERY_SCHEMA_CONFIG,
	GET_PARK_QUERY_SCHEMA_CONFIG,
	INVALID_TRAIL_SLUG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getTrailSchema = yup.object({
	query: createQueryParamsSchema(GET_TRAIL_QUERY_SCHEMA_CONFIG),
});

export const getAllParkSchema = yup.object({
	query: createQueryParamsSchema(GET_PARK_QUERY_SCHEMA_CONFIG),
});

export const getAllNearByTrailSchema = yup.object({
	query: createQueryParamsSchema(GET_NEAR_BY_TRAIL_QUERY_SCHEMA_CONFIG),
});

export const toggleFavouriteTrailSchema = yup.object().shape({
	query: yup.object().shape({
		trailId: yup
			.number()
			.required('trailId is required')
			.typeError('trailId must be a number'),
	}),
});

export const addTrailSchema = yup.object({
	body: yup.object({
		name: yup.string().required(REQUIRED_FIELDS),
		// .test({
		// 	name: 'valid-form',
		// 	message: TRAIL_ALREADY_EXIST,
		// 	async test(value) {
		// 		const record = await prisma.trails.findFirst({
		// 			where: {
		// 				deleted: false,
		// 				name: value,
		// 			},
		// 		});
		// 		return !record || !record.id ? Boolean(1) : Boolean(0);
		// 	},
		// }),
		location: yup.string().required(REQUIRED_FIELDS),
		// surfaceType: yup.string().required(REQUIRED_FIELDS),
		surfaceType: yup.string().notRequired(), // update due to park
		// difficultyLevel: yup.string().required(REQUIRED_FIELDS),
		difficultyLevel: yup.string().notRequired(),
		trailDistance: yup.number().notRequired(),
		estimatedTime: yup.string().notRequired(),
		trail_head_address: yup.string().notRequired(),
		type: yup.string().notRequired(),
		notes: yup.string().notRequired(),
		postal_code: yup.string().notRequired(),
		description: yup.string().notRequired(),
		trailAssociationId: yup.number().notRequired(),
		activities: yup.array().of(yup.string()).notRequired(),
		trailInfo: yup.array().of(yup.string()).notRequired(),
		elevationGain: yup
			.number()
			.notRequired()
			.moreThan(0, 'Elevation gain must be greater than 0'),
		parentId: yup
			.number()
			.notRequired()
			.test({
				name: 'valid-form',
				message: 'Invalid Park id',
				async test(value) {
					if (!value) return true;
					const record = await prisma.trails.findUnique({
						where: {
							deleted: false,
							type: 'PARK',
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	file: yup.mixed().notRequired(),
	files: yup.array().of(yup.mixed()).notRequired(),
});

export const updateTrailSchema = yup.object({
	body: yup.object({
		name: yup.string().notRequired(),
		// .test({
		// 	name: 'valid-form',
		// 	message: TRAIL_ALREADY_EXIST,
		// 	async test(value) {
		// 		if (!value) return true;
		// 		// const { id } = this.options.params;
		// 		const record = await prisma.trails.findFirst({
		// 			where: {
		// 				deleted: false,
		// 				name: value,
		// 				// id: {
		// 				// 	not: parseInt(id, 10),
		// 				// },
		// 			},
		// 		});
		// 		return !record || !record.id ? Boolean(1) : Boolean(0);
		// 	},
		// }),
		location: yup.string().notRequired(),
		surfaceType: yup.string().notRequired(),
		difficultyLevel: yup.string().notRequired(),
		type: yup.string().notRequired(),
		trail_head_address: yup.string().notRequired(),
		deletedArrIds: yup.array().of(yup.number()).notRequired(),
		gpxFileDeletedId: yup.number().notRequired(),
		trailInfo: yup.array().of(yup.string()).notRequired(),
		notes: yup.string().notRequired(),
		elevationGain: yup.number().notRequired(),
		description: yup.string().notRequired(),
		trailDistance: yup.number().notRequired(),
		status: yup.string().notRequired(),
		estimatedTime: yup.string().notRequired(),
		trailAssociationId: yup.number().notRequired(),
		parentId: yup
			.number()
			.notRequired()
			.test({
				name: 'valid-form',
				message: 'Invalid Park id',
				async test(value) {
					if (!value) return true;
					const record = await prisma.trails.findUnique({
						where: {
							deleted: false,
							type: 'PARK',
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	file: yup.mixed().notRequired(),
	files: yup.mixed().notRequired(),
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_TRAIL_ID,
				async test(value) {
					const record = await prisma.trails.findUnique({
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

export const TrailIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_TRAIL_ID,
				async test(value) {
					const record = await prisma.trails.findUnique({
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
export const TrailSlugSchema = yup.object({
	params: yup.object({
		slug: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_TRAIL_SLUG,
				async test(value) {
					const record = await prisma.trails.findUnique({
						where: {
							deleted: false,
							slug: value,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const deleteTrailsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
