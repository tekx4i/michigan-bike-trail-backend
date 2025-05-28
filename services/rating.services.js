import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { RATING_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class RatingService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async getAllRatings() {
		const { query } = this.req;

		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 10;

		const options = {
			where: {
				deleted: false,
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if (key === 'trail_id') {
					return {
						[key]: search[key],
					};
				}
				return {
					[key]: { contains: search[key] },
				};
			});
		}

		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [{ [field]: direction }];
		}

		// Count total records
		const totalCount = await prisma.rating.count(options);

		// Get ratings grouped by stars
		const ratingCounts = await prisma.rating.groupBy({
			by: ['rating'],
			_count: { rating: true },
			_avg: { rating: true },
		});

		// Map rating counts
		const ratingsDistribution = {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
		};

		// let avgRating = 0;
		if (ratingCounts.length > 0) {
			// avgRating = ratingCounts[0]._avg.rating;
			ratingCounts.forEach(item => {
				ratingsDistribution[item.rating] = item._count.rating;
			});
		}

		// Calculate total pages for pagination
		const totalPages = Math.ceil(totalCount / limit);

		// Apply pagination
		options.skip = (page - 1) * limit;
		options.take = limit;

		// const allRecords = await prisma.rating.findMany(options);
		const allRecords = await prisma.rating.findMany({
			...options,
			include: {
				user: true, // Assuming `user` is the relation name for user_id
				trails: true, // Assuming `trail` is the relation name for trail_id
				images: true,
			},
		});

		// const includeTrailsDetails = {
		// 	include: {
		// 		gpxFiles: {
		// 			include: {
		// 				waypoints: true, // Include waypoints
		// 				tracks: {
		// 					include: {
		// 						segments: true, // Include track segments
		// 					},
		// 				},
		// 				routes: {
		// 					include: {
		// 						points: true, // Include route points
		// 					},
		// 				},
		// 			},
		// 		},
		// 	},
		// }
		// const allRecords = await prisma.rating.findMany({
		// 	...options,
		// 	include: {
		// 		user: true, // Assuming `user` is the relation name for user_id
		// 		trails: includeTrailsDetails,   // Assuming `trail` is the relation name for trail_id
		// 		images: true,
		// 	},
		// });

		// console.log('allRecords', allRecords);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0) {
			throw new AppError(RATING_NOT_FOUND, HttpStatus.OK, allRecords);
		}

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			ratingsDistribution,
			// avgRating,
			query,
		};
	}

	// async getRating() {
	// 	const { id } = this.req.params;
	// 	const record = await prisma.rating.findUnique({
	// 		where: {
	// 			deleted: false,
	// 			id: parseInt(id, 10),
	// 		},
	// 	});
	// 	if (!record || !record.id)
	// 		throw new AppError(RATING_NOT_FOUND, HttpStatus.NOT_FOUND);
	// 	return record;
	// }

	// async createRating() {
	// 	const { body, user, file } = this.req;
	// 	if (file) {
	// 		body.file_name = file.filename;
	// 		body.original_name = file.originalname;
	// 	}

	// 	const record = await prisma.rating.create({
	// 		data: {
	// 			...body,
	// 			user_id: user.id,
	// 		},
	// 	});

	// 	return { record };
	// }

	// async updateRating() {
	// 	const { id } = this.req.params;
	// 	const { body } = this.req;

	// 	const updateRecord = await prisma.rating.update({
	// 		where: {
	// 			deleted: false,
	// 			id: parseInt(id, 10),
	// 		},
	// 		data: body,
	// 	});

	// 	return updateRecord;
	// }

	// async createOrUpdateRating() {
	// 	const { body, user, file } = this.req;
	// 	const { trail_id } = body; // Assuming the trail_id is passed in the body

	// 	if (file) {
	// 		body.file_name = file.filename;
	// 		body.original_name = file.originalname;
	// 	}

	// 	// Check if the user has already rated this trail
	// 	const existingRating = await prisma.rating.findFirst({
	// 		where: {
	// 			user_id: user.id,
	// 			trail_id: trail_id,
	// 			deleted: false,
	// 		},
	// 	});

	// 	if (existingRating) {
	// 		// If the rating exists, update it
	// 		const updatedRating = await prisma.rating.update({
	// 			where: {
	// 				id: existingRating.id,
	// 			},
	// 			data: body,
	// 		});
	// 		return updatedRating;
	// 	} else {
	// 		// If the rating doesn't exist, create a new one
	// 		const newRating = await prisma.rating.create({
	// 			data: {
	// 				...body,
	// 				user_id: user.id,
	// 			},
	// 		});
	// 		return { record: newRating };
	// 	}
	// }

	// working
	// async createOrUpdateRating() {
	// 	const { body, user, file } = this.req;
	// 	const { trail_id } = body; // Assuming the trail_id is passed in the body

	// 	if (file) {
	// 		body.file_name = file.filename;
	// 		body.original_name = file.originalname;
	// 	}

	// 	// Check if the user has already rated this trail
	// 	const existingRating = await prisma.rating.findFirst({
	// 		where: {
	// 			user_id: user.id,
	// 			trail_id: trail_id,
	// 			deleted: false,
	// 		},
	// 	});

	// 	let ratingRecord;
	// 	if (existingRating) {
	// 		// Update existing rating
	// 		ratingRecord = await prisma.rating.update({
	// 			where: {
	// 				id: existingRating.id,
	// 			},
	// 			data: body,
	// 		});
	// 	} else {
	// 		// Create new rating
	// 		ratingRecord = await prisma.rating.create({
	// 			data: {
	// 				...body,
	// 				user_id: user.id,
	// 			},
	// 		});
	// 	}

	// 	// Calculate the new average rating for the trail
	// 	const aggregateResult = await prisma.rating.aggregate({
	// 		where: { trail_id: trail_id, deleted: false },
	// 		_avg: { rating: true },
	// 	});

	// 	const newAvgRating = aggregateResult._avg.rating || 0;

	// 	// Update the trail with the new average rating
	// 	await prisma.trails.update({
	// 		where: { id: trail_id },
	// 		data: { avgRating: newAvgRating },
	// 	});

	// 	return { record: ratingRecord };
	// }

	// new
	async createOrUpdateRating() {
		const { body, user } = this.req;

		// const file = this.req.files?.file ? this.req.files.file[0] : null;
		const files = this.req.files?.files || [];

		// console.log('file', file);
		console.log('files', files);
		const { trail_id } = body;

		body.trail_id = parseInt(trail_id, 10);

		// Ensure files is always an array (even if only one file was uploaded)
		const uploadedFiles = Array.isArray(files) ? files : files ? [files] : [];

		// Find existing rating
		const existingRating = await prisma.rating.findFirst({
			where: { user_id: user.id, trail_id: body.trail_id, deleted: false },
			include: { images: true },
		});

		let ratingRecord;

		if (existingRating) {
			ratingRecord = await prisma.rating.update({
				where: { id: existingRating.id },
				data: body,
			});

			// console.log('existingRating');

			if (uploadedFiles.length > 0 && existingRating.images.length > 0) {
				console.log('existingRating.images');
				await prisma.ratingImage.deleteMany({
					where: { rating_id: existingRating.id },
				});
			}
		} else {
			ratingRecord = await prisma.rating.create({
				data: { ...body, user_id: user.id },
			});
		}

		// Save uploaded images
		if (uploadedFiles.length > 0) {
			const imageRecords = uploadedFiles.map(f => ({
				rating_id: ratingRecord.id,
				file_name: f.filename,
				original_name: f.originalname,
				url: `/uploads/${f.filename}`,
			}));

			await prisma.ratingImage.createMany({ data: imageRecords });
		}

		// Recalculate average rating
		const aggregateResult = await prisma.rating.aggregate({
			where: { trail_id: body.trail_id, deleted: false },
			_avg: { rating: true },
			_count: { rating: true },
		});

		await prisma.trails.update({
			where: { id: body.trail_id },
			data: {
				avgRating: aggregateResult._avg.rating || 0,
				ratingCounts: aggregateResult._count.rating || 0,
			},
		});

		return { record: ratingRecord };
	}

	async deleteRating() {
		const { id } = this.req.params;

		if (this.req.user.role.name !== 'ADMIN') {
			throw new AppError(
				'You are not authorized to delete this rating',
				HttpStatus.OK,
			);
		}

		await prisma.rating.update({
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

	async deleteManyRating() {
		const { ids } = this.req.body;

		await prisma.rating.updateMany({
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
