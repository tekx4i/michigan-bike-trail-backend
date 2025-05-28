import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';
import geolib from 'geolib';
import { TRAIL_NOT_FOUND } from '../constants';
import { AppError } from '../errors';
import { parseAndSaveGPX } from '../utils/gpxUtils';
// import { parseAndSaveGPX } from '../utils/gpxUtils';
import fs from 'fs';
import path from 'path';
import {
	// generateUniqueSlug,
	generateUniqueSlugAndTitle,
} from '../utils/generateUniqueSlug';

const prisma = new PrismaClient();

export class TrailService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* Fetch all trails with pagination and search */
	async getAllTrails() {
		const { query } = this.req;

		// console.log('Query : ', query);

		let { page, limit, sort, search, trailCase, ...filter } = query;
		const userId = this.req.user?.id; // Get authenticated user ID if available

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false, // Exclude deleted trails
				// parentId: null, // Only top-level trails (not children)
			},
		};

		// If the user is authenticated, filter by createdBy
		// if (userId) {
		// 	options.where.created_by = userId;
		// }

		if (search) {
			options.where.OR = [
				{ name: { contains: search } },
				{ location: { contains: search } },
				{ type: { contains: search } },
				{ postal_code: { contains: search } },
			];
		}

		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [{ [field]: direction }];
		}

		const totalCount = await prisma.trails.count(options);

		// NEW CODE
		const totalPages = Math.ceil(totalCount / limit);

		// console.log('Filter : ', filter);
		if (filter) {
			options.where.AND = Object.keys(filter).map(key => {
				if (key === 'avgRating') {
					const rating = parseFloat(filter[key]);
					return { avgRating: { gte: rating, lte: rating + 0.99 } };
				}
				if (key === 'trailDistance') {
					let min = 0;
					let max = 0;
					const selectedValue = filter[key];
					if (selectedValue.includes('-')) {
						[min, max] = selectedValue.split('-').map(Number);
					} else if (selectedValue.includes('+')) {
						min = Number(selectedValue.split('+')[0]);
						max = 100000;
					}
					return { [key]: { gte: min, lte: max } };
				}
				return { [key]: { contains: filter[key] } };
			});
		}

		options.skip = (page - 1) * limit;
		options.take = limit;

		// console.log('ROLE : ', this.req.user.role);
		// ROLE BASE
		if (this.req.user?.role?.name === 'ADMIN') {
			// Admin can see all approved and pending trails
			options.where = {
				...options.where,
				deleted: false,
				status: { in: ['APPROVED', 'PENDING'] },
			};
		} else if (this.req.user?.role?.name === 'USER' && trailCase === 'MIX') {
			// User sees their own pending and all approved trails
			options.where = {
				...options.where,
				AND: [
					...options.where.AND || [],
					{
						deleted: false,
						OR: [
							{
								status: 'PENDING',
								created_by: userId,
							},
							{
								status: 'APPROVED',
							},
						],
					},
				],
			};
		} else if (this.req.user?.role?.name === 'USER' && trailCase === 'MINE') {
			// User sees their own approved and pending trails
			options.where = {
				...options.where,
				AND: [
					...options.where.AND || [],
					{
						deleted: false,
						status: { in: ['APPROVED', 'PENDING'] },
						created_by: userId,
					}
				],
			};
		} else if (this.req.user?.role?.name === 'USER') {
			// User sees their own approved and pending trails
			options.where = {
				...options.where,
				AND: [
					...options.where.AND || [],
					{
						deleted: false,
						status: { in: ['APPROVED'] },
						created_by: userId,
					}
				],
			};
		} else {
			// Other roles see only approved trails
			options.where = {
				...options.where,
				AND: [
					...options.where.AND || [],
					{
						deleted: false,
						status: 'APPROVED',
					},
				],
			};
		}

		console.log('OPTIONS WHRE : ', options.where);
		// JOINS
		options.include = {
			gpxFiles: {
				include: {
					waypoints: true, // Include waypoints
					tracks: {
						include: {
							segments: true, // Include track segments
						},
					},
					routes: {
						include: {
							points: true, // Include route points
						},
					},
				},
			},
			trail_gallery: {
				select: {
					id: true,
					image: true,
					original_name: true,
					file_name: true,
				},
			},
			parent: {
				select: {
					name: true,
					location: true,
					latitude: true,
					longitude: true,
				},
			},
			trailAssociation: true,
			updatedByUser: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
				},
			},
		};

		const trails = await prisma.trails.findMany(options);

		if (!trails.length) {
			throw new AppError(TRAIL_NOT_FOUND, HttpStatus.OK);
			// return [];
		}

		return { records: trails, totalRecords: totalCount, totalPages, query };
	}

	// nearByTrails
	async getAllNearByTrails() {
		const { query } = this.req;
		let {
			page,
			limit,
			sort,
			location,
			distance,
			difficultyLevel,
			type,
			rating,
			lat,
			lng,
			trailSlug,
		} = query;

		// let filters = { AND: [] };
		let filters = { deleted: false, AND: [] };
		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;
		let maxDistance = distance ? parseFloat(distance) * 1000 : null; // Convert km/miles to meters

		if (trailSlug) {
			const trail = await prisma.trails.findUnique({
				where: { slug: trailSlug },
				select: { latitude: true, longitude: true },
			});
			if (trail) {
				lat = trail.latitude;
				lng = trail.longitude;
				filters.AND.push({ type: trail?.type });
				maxDistance = parseFloat(100) * 1000;
			}
		}

		// Location filter
		if (location) {
			filters.AND.push({
				location: { contains: location },
			});
		}
		// Location filter
		if (type) {
			filters.AND.push({
				type: { contains: type },
			});
		}

		// Difficulty level filter
		if (difficultyLevel) {
			filters.AND.push({ difficultyLevel: { equals: difficultyLevel } });
		}

		// Average rating filter
		if (rating) {
			const rating1 = parseFloat(rating);
			filters.AND.push({
				avgRating: {
					gte: rating1 - 1.0, // Lower bound
					lte: rating1, // Upper bound
				},
			});
		}

		const includeTrailsDetails = {
			include: {
				gpxFiles: {
					include: {
						waypoints: true, // Include waypoints
						tracks: {
							include: {
								segments: true, // Include track segments
							},
						},
						routes: {
							include: {
								points: true, // Include route points
							},
						},
					},
				},
				// trailAssociation: true, // new field
				trail_gallery: {
					select: {
						id: true,
						image: true,
						original_name: true,
						file_name: true,
					},
				},
				updatedByUser: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
					},
				},
			},
		};
		// Fetch all trails first (will filter distance later)
		let trails = await prisma.trails.findMany({
			where: filters,
			...includeTrailsDetails,
		});

		// remove current trailSlug
		if (trailSlug) {
			trails = trails.filter(trail => trail.slug !== trailSlug);
		}

		// Distance filter using geolib
		if (lat && lng && maxDistance) {
			trails = trails.filter(trail => {
				if (trail.latitude && trail.longitude) {
					const distance = geolib.getDistance(
						{ latitude: lat, longitude: lng },
						{
							latitude: parseFloat(trail.latitude),
							longitude: parseFloat(trail.longitude),
						},
					);
					return distance <= maxDistance; // Convert km to meters
				}
				return false;
			});
		}

		// // Distance filter using geolib
		// if (lat && lng && maxDistance) {
		// 	trails = trails.filter(trail => {
		// 		// Ensure latitude and longitude are valid numbers
		// 		if (
		// 			trail.latitude != null &&
		// 			trail.longitude != null &&
		// 			!isNaN(parseFloat(trail.latitude)) &&
		// 			!isNaN(parseFloat(trail.longitude))
		// 		) {
		// 			const distance = geolib.getDistance(
		// 				{ latitude: lat, longitude: lng },
		// 				{
		// 					latitude: parseFloat(trail.latitude),
		// 					longitude: parseFloat(trail.longitude),
		// 				},
		// 			);
		// 			return distance <= maxDistance; // Filter based on maxDistance
		// 		}
		// 		return false; // Skip if latitude or longitude is missing or invalid
		// 	});
		// }

		// if (sort) {
		// 	const [field, direction] = sort.split(':');
		// 	options.orderBy = [{ [field]: direction }];
		// }

		// Sorting logic
		if (sort) {
			const [sortField, sortOrder] = sort.split(':');
			trails = trails.sort((a, b) => {
				if (sortOrder === 'desc') return b[sortField] - a[sortField];
				return a[sortField] - b[sortField];
			});
		}

		// if (trails.length > 0) {
		// 	// Filter out deleted GPX files
		// 		trails.forEach(trail => {
		// 			if (trail.gpxFiles && Array.isArray(trail.gpxFiles)) {
		// 				trail.gpxFiles = trail.gpxFiles.filter(file => !file.deleted);
		// 			}
		// 		});
		// 	}

		// Pagination
		const totalRecords = trails.length;
		const totalPages = Math.ceil(totalRecords / limit);
		const paginatedTrails = trails.slice((page - 1) * limit, page * limit);

		if (!paginatedTrails.length) {
			// throw new AppError(TRAIL_NOT_FOUND, HttpStatus.OK);
			return [];
		}

		if (this.req.user?.id) {
			// Fetch user's favorite trails
			const favoriteTrails = await prisma.favouriteTrails.findMany({
				where: {
					userId: this.req.user.id, // Assuming user ID is available in req.user
				},
			});

			// Convert the favorite trails array into a Set for quick lookup
			const favoriteTrailIds = new Set(
				favoriteTrails.map(trail => trail.trailId),
			);

			// Set `isFavorite` to true for matching trails
			const trailsWithFavoriteStatus = paginatedTrails.map(trail => {
				return {
					...trail,
					isFavorite: favoriteTrailIds.has(trail.id), // Set isFavorite based on matching trailId
				};
			});
			return { records: trailsWithFavoriteStatus, totalRecords, totalPages };
		}

		return { records: paginatedTrails, totalRecords, totalPages };
	}

	// working
	// Use rating side service api for reference
	/* Fetch a single trail by ID */
	async getTrail() {
		const { id } = this.req.params;
		const includeTrailsDetails = {
			include: {
				gpxFiles: {
					include: {
						waypoints: true, // Include waypoints
						tracks: {
							include: {
								segments: true, // Include track segments
							},
						},
						routes: {
							include: {
								points: true, // Include route points
							},
						},
					},
				},
				trailAssociation: true,
				trail_gallery: {
					select: {
						image: true,
						original_name: true,
						file_name: true,
					},
				},
				parent: {
					select: {
						id: true,
						name: true,
						location: true,
						latitude: true,
						longitude: true,
					},
				},
				children: true,
				updatedByUser: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
					},
				},
			},
		};
		const trail = await prisma.trails.findUnique({
			where: { id: parseInt(id, 10), deleted: false },
			...includeTrailsDetails,
		});

		if (!trail) throw new AppError(TRAIL_NOT_FOUND, HttpStatus.OK);

		if (trail.gpxFiles.length > 0) {
			trail.gpxFiles = trail.gpxFiles.filter(file => !file.deleted);
		}

		return trail;
	}
	async getTrailBySlug() {
		const { slug } = this.req.params;
		const includeTrailsDetails = {
			include: {
				// where: { deleted: false },
				gpxFiles: {
					include: {
						waypoints: true, // Include waypoints
						tracks: {
							include: {
								segments: true, // Include track segments
							},
						},
						routes: {
							include: {
								points: true, // Include route points
							},
						},
					},
				},
				trailAssociation: true,
				trail_gallery: {
					select: {
						id: true,
						image: true,
						original_name: true,
						file_name: true,
					},
				},
				parent: {
					select: {
						name: true,
						location: true,
						latitude: true,
						longitude: true,
					},
				},
				// children: true,
				children: {
					include: {
						trail_gallery: {
							select: {
								image: true,
								original_name: true,
								file_name: true,
							},
						},
					},
				},
				updatedByUser: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
					},
				},
			},
		};
		let trail = await prisma.trails.findUnique({
			where: { slug: slug, deleted: false },
			...includeTrailsDetails,
		});

		if (!trail) throw new AppError(TRAIL_NOT_FOUND, HttpStatus.OK);

		if (trail.gpxFiles.length > 0) {
			trail.gpxFiles = trail.gpxFiles.filter(file => !file.deleted);
		}

		return trail;
	}

	/* Create a new trail or Park */
	async createTrail() {
		const { body, user } = this.req;
		const file = this.req.files?.file ? this.req.files.file[0] : null;
		const files = this.req.files?.files || [];

		// at least one image is required
		if (files.length === 0) {
			throw new AppError('At least one image is required', HttpStatus.OK);
		}

		// Ensure files is always an array (even if only one file was uploaded)
		// const uploadedFiles = Array.isArray(files) ? files : files ? [files] : [];
		body.created_by = user.id;
		// if (file) {
		// 	body.file_name = file.filename;
		// 	body.original_name = file.originalname;
		// }

		// if (body.type !== 'PARK' && body.type !== 'TRAIL') {
		// 	throw new AppError('INVALID_TYPE', HttpStatus.OK);
		// }

		if (this.req.user?.role?.name === 'ADMIN') {
			body.status = 'APPROVED';
		}

		// const records = await prisma.trails.findMany({
		// 	where: { name: body.name },
		// });

		// const slugify = str => {
		// 	return str
		// 		.toLowerCase()
		// 		.replace(/ /g, '-')
		// 		.replace(/[^\w-]+/g, '');
		// };

		// const slug = slugify(body.name);

		// body.slug = slug;

		// body.slug = await generateUniqueSlug(body.name);
		const { slug, title } = await generateUniqueSlugAndTitle(body.name);
		body.slug = slug;
		body.name = title;

		// if (records.length > 0) {
		// 	body.name = `${body.name}-${records.length}`;
		// }

		if (body.type == 'PARK') {
			const newRecord = await prisma.trails.create({ data: body });

			// Save uploaded images
			if (files.length > 0) {
				const imageRecords = files.map(f => ({
					trail_id: newRecord.id,
					file_name: f.filename,
					original_name: f.originalname,
					// url: `/uploads/${f.filename}`,
				}));

				await prisma.trail_gallery.createMany({ data: imageRecords });
			}
			return newRecord;
		}

		const newRecord = await prisma.trails.create({ data: body });

		if (file) {
			await parseAndSaveGPX(file.path, file.originalname, newRecord.id);
		}
		// Save uploaded images
		if (files.length > 0) {
			const imageRecords = files.map(f => ({
				trail_id: newRecord.id,
				file_name: f.filename,
				original_name: f.originalname,
				// url: `/uploads/${f.filename}`,
			}));

			await prisma.trail_gallery.createMany({ data: imageRecords });
		}

		return newRecord;
	}

	async getAllParks() {
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
		// 		trail_gallery: {
		// 			select: {
		// 				image: true,
		// 				original_name: true,
		// 				file_name: true,
		// 			},
		// 		},
		// 		children: true,
		// 	},
		// };

		const includeTrailsDetails = {
			include: {
				gpxFiles: {
					include: {
						waypoints: true,
						tracks: {
							include: {
								segments: true,
							},
						},
						routes: {
							include: {
								points: true,
							},
						},
					},
				},
				trail_gallery: {
					select: {
						image: true,
						original_name: true,
						file_name: true,
					},
				},
				children: {
					include: {
						trail_gallery: {
							select: {
								image: true,
								original_name: true,
								file_name: true,
							},
						},
					},
				},
			},
		};

		if (this.req.user) {
			// console.log('User is logged in', this.req.user.id);
			// fetch all parks for the user
			const parks = await prisma.trails.findMany({
				where: {
					type: 'PARK',
					created_by: this.req.user.id,
				},
				...includeTrailsDetails,
			});
			return parks;
		}
		return await prisma.trails.findMany({
			where: {
				parentId: null,
				type: 'PARK',
			},
			...includeTrailsDetails,
		});
	}

	async updateTrail() {
		const { id } = this.req.params;
		const { body } = this.req;
		let { deletedArrIds, gpxFileDeletedId, trailInfo, status } = body;

		body.updated_by = this.req.user.id;

		const file = this.req.files?.file ? this.req.files?.file[0] : null;
		const files = this.req.files?.files || [];

		// Check if the trail exists
		const existingTrail = await prisma.trails.findUnique({
			where: { id: parseInt(id, 10) },
			include: { trail_gallery: true }, // Include images
		});

		if (!existingTrail) {
			throw new AppError('TRAIL_NOT_FOUND', HttpStatus.OK);
		}

		if (this.req.user.role.name === 'ADMIN' && status) {
			body.status = status;
		}

		if (body.type && body.type !== 'PARK' && body.type !== 'TRAIL') {
			throw new AppError('INVALID_TYPE', HttpStatus.OK);
		}

		if (body.type === 'PARK') {
			body.parentId = null;
		}

		// // Delete previous GPX file if a new one is uploaded
		// if (file && existingTrail.file_name) {
		// 	const oldFilePath = path.join('temp_uploads', existingTrail.file_name);
		// 	if (fs.existsSync(oldFilePath)) {
		// 		fs.unlinkSync(oldFilePath);
		// 	}
		// }

		if (gpxFileDeletedId && existingTrail?.file_name) {
			const oldFilePath = path.join('temp_uploads', existingTrail.file_name);

			try {
				await fs.promises.access(oldFilePath); // check if file exists
				await fs.promises.unlink(oldFilePath);
				console.log(`Deleted old GPX file: ${oldFilePath}`);
			} catch (err) {
				console.warn(
					`GPX file not found or couldn't be deleted: ${oldFilePath}`,
				);
			}
		}

		if (gpxFileDeletedId) {
			// update the gpx model for soft delete
			await prisma.gPXFile.update({
				where: { id: gpxFileDeletedId },
				data: { deleted: true },
			});

			delete body.gpxFileDeletedId;
		}

		// // Delete previous images if new ones are uploaded
		// if (files?.length > 0 && existingTrail?.trail_gallery.length > 0) {
		// 	existingTrail.gallery.forEach(img => {
		// 		const imgPath = path.join('temp_uploads', img.file_name);
		// 		if (fs.existsSync(imgPath)) {
		// 			fs.unlinkSync(imgPath);
		// 		}
		// 	});

		// 	// // Remove old image records from DB
		// 	// await prisma.trail_gallery.deleteMany({
		// 	// 	where: { trail_id: existingTrail.id,id: { in: deletedArrIds } },
		// 	// });
		// }

		// Delete previous images from filesystem only if they're in deletedArrIds
		if (deletedArrIds?.length > 0 && existingTrail?.trail_gallery.length > 0) {
			for (const img of existingTrail.trail_gallery) {
				// Sync vs Async File Deletion
				// if (deletedArrIds.includes(img.id)) {
				// 	const imgPath = path.join('temp_uploads', img.file_name);
				// 	if (fs.existsSync(imgPath)) {
				// 		fs.unlinkSync(imgPath);
				// 	}
				// }
				if (deletedArrIds.includes(img.id)) {
					const imgPath = path.join('temp_uploads', img.file_name);
					try {
						await fs.promises.unlink(imgPath);
					} catch (err) {
						// Optionally log: file might not exist
						console.warn(`File not found or couldn't be deleted: ${imgPath}`);
					}
				}
			}
		}
		// Delete image records from DB
		if (deletedArrIds?.length > 0) {
			await prisma.trail_gallery.deleteMany({
				where: { trail_id: existingTrail.id, id: { in: deletedArrIds } },
			});
			delete body.deletedArrIds;
		}

		if (body.name) {
			// body.slug = await generateUniqueSlug(body.name, id);
			const { slug, title } = await generateUniqueSlugAndTitle(body.name, id);
			body.name = title;
			body.slug = slug;
		}

		// Update the trail record
		const updatedTrail = await prisma.trails.update({
			where: { id: parseInt(id, 10) },
			data: body,
		});

		// If a new GPX file is uploaded, process and save it
		if (file) {
			await parseAndSaveGPX(file.path, file.originalname, updatedTrail.id);
		}

		// Save new uploaded images
		if (files?.length > 0) {
			const imageRecords = files.map(f => ({
				trail_id: updatedTrail.id,
				file_name: f.filename,
				original_name: f.originalname,
			}));

			await prisma.trail_gallery.createMany({ data: imageRecords });
		}

		return updatedTrail;
	}

	/* Soft delete a trail */
	async deleteTrail() {
		const { id } = this.req.params;

		const updatedTrail = await prisma.trails.update({
			where: { id: parseInt(id, 10) },
			data: { deleted: true }, // Assuming 'deleted' is a boolean field
		});

		if (!updatedTrail)
			throw new AppError(TRAIL_NOT_FOUND, HttpStatus.NOT_FOUND);

		return updatedTrail;
	}

	// Toggle add or remove a trail as a favorite
	async toggleFavouriteTrail() {
		const trailId = this.req.query.trailId;
		const userId = this.req.user.id;
		// Check if the trail exists
		const trail = await prisma.trails.findUnique({ where: { id: trailId } });
		if (!trail) {
			throw new AppError('Trail not found', HttpStatus.OK);
		}

		// Check if the trail is already in the user's favorites
		const existingFavourite = await prisma.favouriteTrails.findFirst({
			where: {
				userId,
				trailId,
			},
		});

		if (existingFavourite) {
			// If the trail is already a favorite, remove it
			await prisma.favouriteTrails.delete({
				where: {
					id: existingFavourite.id,
				},
			});
			return { message: 'Trail removed from favorites' };
		} else {
			// If the trail is not a favorite, add it
			await prisma.favouriteTrails.create({
				data: {
					userId,
					trailId,
				},
			});
			return { message: 'Trail added to favorites' };
		}
	}

	// Get all favorite trails for a specific user
	async getUserFavouriteTrails() {
		const userId = this.req.user.id;
		const favouriteTrails = await prisma.favouriteTrails.findMany({
			where: {
				userId,
			},
			include: {
				trail: true, // Include the trail details in the result
			},
		});

		return favouriteTrails.map(fav => fav.trail); // Return only trail details
	}

	async fetchTrailsStatistics() {
		const userId = this.req.user.id;

		// Count the number of reviews given by the user
		const reviewsCount = await prisma.rating.count({
			where: {
				user_id: userId,
			},
		});

		// Count the number of trails created by the user
		const createdTrailsCount = await prisma.trails.count({
			where: {
				deleted: false,

				created_by: userId, // Assuming "createdBy" is the field referencing the user who created the trail
			},
		});
		const pendingTrailsCount = await prisma.trails.count({
			where: {
				deleted: false,
				status: 'PENDING',
				created_by: userId, // Assuming "createdBy" is the field referencing the user who created the trail
			},
		});

		return {
			reviewsCount,
			createdTrailsCount,
			pendingTrailsCount,
		};
	}

	async getDashboardStats() {
		console.log('Get Dashboard Stats');
		const [
			totalUsers,
			activeUsers,
			inactiveUsers,
			totalReviews,
			trialsPending,
			trialsApproved,
			trialsRejected,
			associationsCount,
		] = await Promise.all([
			prisma.users.count(),
			prisma.users.count({ where: { status: 'ACTIVE', deleted: false } }),
			prisma.users.count({ where: { status: 'INACTIVE', deleted: false } }),
			prisma.rating.count({ where: { deleted: false } }),
			prisma.trails.count({ where: { status: 'PENDING', deleted: false } }),
			prisma.trails.count({ where: { status: 'APPROVED', deleted: false } }),
			prisma.trails.count({ where: { status: 'REJECTED', deleted: false } }),
			prisma.trailAssociations.count({ where: { deleted: false } }),
		]);

		return {
			totalUsers,
			activeUsers,
			inactiveUsers,
			totalReviews,
			trails: {
				pending: trialsPending,
				approved: trialsApproved,
				rejected: trialsRejected,
			},
			associationsCount,
		};
	}
}
