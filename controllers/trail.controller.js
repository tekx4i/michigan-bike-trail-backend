import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';
import { TrailService } from '../services';
import { successResponse } from '../utils';
import {
	TRAIL_CREATED,
	// TRAIL_FETCHED,
	TRAIL_UPDATED,
	TRAIL_DELETED,
	TRAIL_FETCHED,
	FAV_TRAIL_TOGGLED,
} from '../constants';

export const createTrail = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.createTrail();
	return successResponse(res, HttpStatus.CREATED, TRAIL_CREATED, data);
});

export const getTrail = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.getTrail();
	return successResponse(res, HttpStatus.OK, TRAIL_FETCHED, data);
});
export const getTrailBySlug = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.getTrailBySlug();
	return successResponse(res, HttpStatus.OK, TRAIL_FETCHED, data);
});

export const getAllTrails = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.getAllTrails();
	return successResponse(res, HttpStatus.OK, TRAIL_FETCHED, data);
});

export const getAllNearByTrails = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.getAllNearByTrails();
	return successResponse(res, HttpStatus.OK, TRAIL_FETCHED, data);
});

export const getAllParks = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.getAllParks();
	return successResponse(res, HttpStatus.OK, TRAIL_FETCHED, data);
});

export const updateTrail = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.updateTrail();
	return successResponse(res, HttpStatus.OK, TRAIL_UPDATED, data);
});

export const deleteTrail = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.deleteTrail();
	return successResponse(res, HttpStatus.OK, TRAIL_DELETED, data);
});
export const toggleFavouriteTrail = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.toggleFavouriteTrail();
	return successResponse(res, HttpStatus.OK, FAV_TRAIL_TOGGLED, data);
});
export const getUserFavouriteTrails = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.getUserFavouriteTrails();
	return successResponse(res, HttpStatus.OK, FAV_TRAIL_TOGGLED, data);
});
export const fetchTrailsStatistics = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.fetchTrailsStatistics();
	return successResponse(res, HttpStatus.OK, TRAIL_FETCHED, data);
});
export const getDashboardStats = asyncHandler(async (req, res) => {
	const trailService = new TrailService(req);
	const data = await trailService.getDashboardStats();
	return successResponse(res, HttpStatus.OK, 'Dashboard data fetched', data);
});
