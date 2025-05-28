import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_RATING_SUCCESS,
	RATING_CREATED_SUCCESS,
	RATING_UPDATED_SUCCESS,
	RATING_DELETED_SUCCESS,
} from '../constants';
import { RatingService } from '../services';
import { successResponse } from '../utils';

export const getAllRatings = asyncHandler(async (req, res) => {
	const ratingService = new RatingService(req);
	const data = await ratingService.getAllRatings();

	return successResponse(res, HttpStatus.OK, GET_RATING_SUCCESS, data);
});

export const getRating = asyncHandler(async (req, res) => {
	const ratingService = new RatingService(req);
	const data = await ratingService.getRating();

	return successResponse(res, HttpStatus.OK, GET_RATING_SUCCESS, data);
});

// export const createRating = asyncHandler(async (req, res) => {
// 	const ratingService = new RatingService(req);
// 	const data = await ratingService.createRating();

// 	return successResponse(res, HttpStatus.OK, RATING_CREATED_SUCCESS, data);
// });

// export const updateRating = asyncHandler(async (req, res) => {
// 	const ratingService = new RatingService(req);
// 	const data = await ratingService.updateRating();

// 	return successResponse(res, HttpStatus.OK, RATING_UPDATED_SUCCESS, data);
// });

export const createOrUpdateRating = asyncHandler(async (req, res) => {
	const ratingService = new RatingService(req);
	const data = await ratingService.createOrUpdateRating();

	return successResponse(res, HttpStatus.OK, RATING_UPDATED_SUCCESS, data);
});
export const deleteRating = asyncHandler(async (req, res) => {
	const ratingService = new RatingService(req);
	const data = await ratingService.deleteRating();

	return successResponse(res, HttpStatus.OK, RATING_DELETED_SUCCESS, data);
});

export const deleteManyRating = asyncHandler(async (req, res) => {
	const ratingService = new RatingService(req);
	const data = await ratingService.deleteManyRating();

	return successResponse(res, HttpStatus.OK, RATING_DELETED_SUCCESS, data);
});
