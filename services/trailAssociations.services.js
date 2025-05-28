import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { TRAILASSOCIATION_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class TrailAssociationsService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllTrailAssociations() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		// console.log('Search : ', search);

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => ({
				[key]: { contains: search[key] },
			}));
		}
		// if (sort) {
		// 	const [field, direction] = sort.split(':');
		// 	options.orderBy = [
		// 		{
		// 			[field]: direction,
		// 		},
		// 	];
		// }

		const totalCount = await prisma.trailAssociations.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.trailAssociations.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(TRAILASSOCIATION_NOT_FOUND, HttpStatus.OK, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getTrailAssociations() {
		const { id } = this.req.params;
		const record = await prisma.trailAssociations.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(TRAILASSOCIATION_NOT_FOUND, HttpStatus.OK);
		return record;
	}

	async createTrailAssociations() {
		const { body } = this.req;

		if (this.req.files?.image?.length > 0) {
			const image = this.req.files.image[0]; // First file in the array

			(body.file_name = image.filename),
				(body.original_name = image.originalname);
		}

		const record = await prisma.trailAssociations.create({
			data: {
				...body,
			},
		});

		return { record };
	}

	async updateTrailAssociations() {
		const { id } = this.req.params;
		const { body } = this.req;

		if (this.req.files?.image?.length > 0) {
			const image = this.req.files?.image[0]; // First file in the array
			(body.file_name = image.filename),
				(body.original_name = image.originalname);
		}

		const updateRecord = await prisma.trailAssociations.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteTrailAssociations() {
		const { id } = this.req.params;

		await prisma.trailAssociations.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				deleted: true,
			},
		});

		return null;
	}

	async deleteManyTrailAssociations() {
		const { ids } = this.req.body;

		await prisma.trailAssociations.updateMany({
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
}
