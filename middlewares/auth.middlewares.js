import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import {
	INVALID_ACCESS_TOKEN,
	NOT_ENOUGH_RIGHTS,
	UNAUTHORIZED,
	USER_NOT_FOUND,
	OTP_NOT_VERIFIED,
} from '../constants';
import { AppError } from '../errors';
import { verifyAccessToken, verifyOtpToken } from '../utils';

const prisma = new PrismaClient();

const sanitizeUser = ({
	password,
	email,
	number,
	remember_token,
	UserFavoriteActivities,
	...safeUser
}) => safeUser;

// console.log('Token User : ', sanitizeUser(req.user));

export const isAuth = async (req, res, next) => {
	try {
		if (!req.headers.authorization)
			throw new AppError(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
		const token = req.headers.authorization.split(' ')[1];
		const decoded = await verifyAccessToken(token);

		if (!decoded || !decoded.id)
			throw new AppError(INVALID_ACCESS_TOKEN, HttpStatus.UNAUTHORIZED);
		const user = await prisma.users.findUnique({
			where: { deleted: false, id: decoded.id },
			include: {
				UserFavoriteActivities: true,
				role: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
			},
		});
		if (!user || !user.id)
			throw new AppError(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
		req.user = user;

		// console.log('Token User : ', sanitizeUser(req.user));
		// console.log('Token User : ', req.user);

		const {
			id,
			firstName,
			lastName,
			status,
			role,
			deleted,
			UserFavoriteActivities,
		} = req.user || {};
		console.log('Token User : ', {
			id,
			firstName,
			lastName,
			status,
			deleted,
			role,
		});
		next();
	} catch (error) {
		next(error);
	}
};

export const resetCheck = async (req, res, next) => {
	try {
		if (!req.headers.authorization)
			throw new AppError(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
		const token = req.headers.authorization.split(' ')[1];
		const decoded = await verifyOtpToken(token);

		if (!decoded || !decoded.userId)
			throw new AppError(INVALID_ACCESS_TOKEN, HttpStatus.UNAUTHORIZED);
		const user = await prisma.users.findUnique({
			where: { deleted: false, id: decoded.userId, remember_token: token },
		});
		if (!user || !user.id)
			throw new AppError(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};

export const checkAuth = async (req, res, next) => {
	try {
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(' ')[1];
			const decoded = await verifyAccessToken(token);

			if (!decoded || !decoded.id)
				throw new AppError(INVALID_ACCESS_TOKEN, HttpStatus.UNAUTHORIZED);
			const user = await prisma.users.findUnique({
				where: { deleted: false, id: decoded.id },
			});
			if (!user || !user.id)
				throw new AppError(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
			req.user = user;
		}
		next();
	} catch (error) {
		next(error);
	}
};

export const optionalAuth = async (req, res, next) => {
	try {
		if (!req.headers.authorization) {
			req.user = null;
			return next();
		}

		const token = req.headers.authorization.split(' ')[1];
		const decoded = await verifyAccessToken(token);

		if (!decoded || !decoded.id) {
			req.user = null;
			return next();
		}

		const user = await prisma.users.findUnique({
			where: {
				id: decoded.id,
				deleted: false,
			},
			include: {
				// UserFavoriteActivities: true,
				role: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
			},
		});

		if (!user) {
			req.user = null;
			return next();
		}

		req.user = user;
		return next();
	} catch (error) {
		req.user = null;
		return next();
	}
};

export const verifyOTP = async (req, res, next) => {
	try {
		const { otp } = req.body;
		const { id } = req.params;
		const user = await prisma.users.findUnique({
			where: { deleted: false, id: parseInt(id, 10) },
		});

		if (!user || !user.id || !user.remember_token)
			throw new AppError(USER_NOT_FOUND, HttpStatus.OK);

		const decoded = await verifyOtpToken(user.remember_token);

		if (
			!decoded ||
			!decoded.userId ||
			!decoded.OTP ||
			parseInt(decoded.OTP, 10) !== parseInt(otp, 10)
		)
			throw new AppError(OTP_NOT_VERIFIED, HttpStatus.OK);

		req.type = decoded.type ? decoded.type : 'verify';
		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};

export const authorize = roles => {
	return (req, res, next) => {
		if (roles.includes(req.user.role.name)) return next();
		throw new AppError(NOT_ENOUGH_RIGHTS, HttpStatus.OK);
	};
};
