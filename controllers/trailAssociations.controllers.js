import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_TRAILASSOCIATION_SUCCESS,
	TRAILASSOCIATION_CREATED_SUCCESS,
	TRAILASSOCIATION_UPDATED_SUCCESS,
	TRAILASSOCIATION_DELETED_SUCCESS,
} from '../constants';
import { TrailAssociationsService } from '../services';
import { successResponse } from '../utils';

export const getAllTrailAssociationss = asyncHandler(async (req, res) => {
	const trailAssociationsService = new TrailAssociationsService(req);
	const data = await trailAssociationsService.getAllTrailAssociations();

	return successResponse(
		res,
		HttpStatus.OK,
		GET_TRAILASSOCIATION_SUCCESS,
		data,
	);
});

export const getTrailAssociations = asyncHandler(async (req, res) => {
	const trailAssociationsService = new TrailAssociationsService(req);
	const data = await trailAssociationsService.getTrailAssociations();

	return successResponse(
		res,
		HttpStatus.OK,
		GET_TRAILASSOCIATION_SUCCESS,
		data,
	);
});

export const createTrailAssociations = asyncHandler(async (req, res) => {
	const trailAssociationsService = new TrailAssociationsService(req);
	const data = await trailAssociationsService.createTrailAssociations();

	return successResponse(
		res,
		HttpStatus.OK,
		TRAILASSOCIATION_CREATED_SUCCESS,
		data,
	);
});

export const updateTrailAssociations = asyncHandler(async (req, res) => {
	const trailAssociationsService = new TrailAssociationsService(req);
	const data = await trailAssociationsService.updateTrailAssociations();

	return successResponse(
		res,
		HttpStatus.OK,
		TRAILASSOCIATION_UPDATED_SUCCESS,
		data,
	);
});

export const deleteTrailAssociations = asyncHandler(async (req, res) => {
	const trailAssociationsService = new TrailAssociationsService(req);
	const data = await trailAssociationsService.deleteTrailAssociations();

	return successResponse(
		res,
		HttpStatus.OK,
		TRAILASSOCIATION_DELETED_SUCCESS,
		data,
	);
});

export const deleteManyTrailAssociations = asyncHandler(async (req, res) => {
	const trailAssociationsService = new TrailAssociationsService(req);
	const data = await trailAssociationsService.deleteManyTrailAssociations();

	return successResponse(
		res,
		HttpStatus.OK,
		TRAILASSOCIATION_DELETED_SUCCESS,
		data,
	);
});
