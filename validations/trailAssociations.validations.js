import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INTEGER_ERROR,
	REQUIRED_FIELDS,
	INVALID_TRAILASSOCIATION_ID,
	TRAILASSOCIATION_ALREADY_EXIST,
	GET_TRAILASSOCIATION_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getTrailAssociationsSchema = yup.object({
	query: createQueryParamsSchema(GET_TRAILASSOCIATION_QUERY_SCHEMA_CONFIG),
});

export const addTrailAssociationsSchema = yup.object({
	body: yup.object({
		title: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: TRAILASSOCIATION_ALREADY_EXIST,
				async test(value) {
					// console.log('Value : ', value);
					const record = await prisma.trailAssociations.findFirst({
						where: {
							deleted: false,
							title: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		description: yup.string().notRequired(),
		url: yup.string().notRequired(),
		email: yup.string().notRequired(),
		phoneNo: yup.string().notRequired(),
		regionName: yup.string().notRequired(),
		lat: yup.string().notRequired(),
		lng: yup.string().notRequired(),
	}),
	files: yup.array().of(yup.mixed()).notRequired(),
});

export const updateTrailAssociationsSchema = yup.object({
	body: yup.object({
		// title: yup
		// 	.string()
		// 	.notRequired()
		// 	.test({
		// 		name: 'valid-form',
		// 		message: TRAILASSOCIATION_ALREADY_EXIST,
		// 		async test(value) {
		// 			if (!value) return true;
		// 			const { params } = this.options.context;
		// 			const id = parseInt(params?.id, 10);
		// 			const record = await prisma.trailAssociations.findFirst({
		// 				where: {
		// 					deleted: false,
		// 					title: value,
		// 					id: {
		// 						not: parseInt(id, 10),
		// 					},
		// 				},
		// 			});
		// 			return !record || !record.id ? Boolean(1) : Boolean(0);
		// 		},
		// 	}),

		title: yup
			.string()
			.notRequired()
			.test({
				name: 'unique-title',
				message: TRAILASSOCIATION_ALREADY_EXIST,
				async test(value) {
					if (!value) return true;

					const { params } = this.options.context;
					const id = parseInt(params?.id, 10);

					const record = await prisma.trailAssociations.findFirst({
						where: {
							deleted: false,
							title: value,
							id: {
								not: id, // don't match against the current record
							},
						},
					});

					return !record; // if no other record has the same title, it's valid
				},
			}),
		description: yup.string().notRequired(),
		url: yup.string().notRequired(),
		regionName: yup.string().notRequired(),
		lat: yup.string().notRequired(),
		email: yup.string().notRequired(),
		phoneNo: yup.string().notRequired(),
		lng: yup.string().notRequired(),
	}),
	// image: yup.array().of(yup.mixed()).notRequired(),
	files: yup.array().of(yup.mixed()).notRequired(),
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_TRAILASSOCIATION_ID,
				async test(value) {
					const record = await prisma.trailAssociations.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					console.log('record', record);
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const TrailAssociationsIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_TRAILASSOCIATION_ID,
				async test(value) {
					const record = await prisma.trailAssociations.findUnique({
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

export const deleteTrailAssociationssSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
