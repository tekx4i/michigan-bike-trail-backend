import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import moment from 'moment';

import HttpStatus from 'http-status-codes';

import {
	INVALID_CREDENTIALS,
	USER_NOT_FOUND,
	ACCOUNT_STATUS,
	NOT_ALLOWED_TO_LOGIN,
	WRONG_OLD_PASSWORD,
} from '../constants';
import { AppError } from '../errors';
import { createAccessToken, createOtpToken, sendEmail } from '../utils';

const prisma = new PrismaClient();

export class AuthService {
	constructor(req) {
		this.req = req;
	}

	async login() {
		const { email, password, role } = this.req.body;

		const user = await prisma.users.findFirst({
			where: {
				deleted: false,
				email,
				status: ACCOUNT_STATUS.ACTIVE,
			},
			include: {
				role: true,
			},
		});

		if (!user || !user.id) throw new AppError(USER_NOT_FOUND, HttpStatus.OK);

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid)
			throw new AppError(INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);

		if (role && role !== user.role)
			throw new AppError(NOT_ALLOWED_TO_LOGIN, HttpStatus.BAD_REQUEST);

		await prisma.auth_log.create({
			data: {
				user_id: user.id,
				type: 'login',
			},
		});

		const updateRecord = this.publicProfile(user);

		return {
			accessToken: createAccessToken({ id: user.id }),
			user: updateRecord,
		};
	}

	async register() {
		const { body } = this.req;
		const { password } = body;

		body.password = await bcrypt.hash(password, 12);
		// const birthDate = body.birth_date;
		// body.birth_date = new Date(`${birthDate}T00:00:00.000Z`);
		body.status = ACCOUNT_STATUS.ACTIVE;

		if (this.req.user && this.req.user.id) body.created_by = this.req.user.id;

		const user = await prisma.users.create({ data: body });
		// add user favourite activities
		const favouriteActivities = await prisma.userFavoriteActivities.create({
			data: { user_id: user.id },
		});

		if (!favouriteActivities) {
			throw new AppError('FAVOURITE_ACTIVITIES_NOT_INSERTED', HttpStatus.OK);
		}

		const updateRecord = this.publicProfile(user);
		// const updateRecord = await this.createOTP(user.id);

		// const data = {
		// 	subject: 'Welocme to Trusty Feed',
		// 	name: updateRecord.name,
		// };
		// notification(updateRecord, 'mail', data, 'welcome');

		return this.publicProfile(updateRecord);
	}

	// async getLoggedInUser() {
	// 	const { user } = this.req;
	// 	return this.publicProfile(user);
	// }

	async getLoggedInUser() {
		const { user } = this.req;

		return {
			...this.publicProfile(user),
			memberSince: {
				month: moment(user.created_at).format('MMMM'), // Full month name (e.g., "March")
				year: moment(user.created_at).format('YYYY'), // Year (e.g., "2025")
			},
		};
	}

	async OtpVerify() {
		const { type } = this.req;
		const { id } = this.req.params;
		let updateData;
		let rememberToken;
		let updateRecord;

		if (type === 'reset') {
			rememberToken = createOtpToken({ userId: id, type });
			updateData = { remember_token: rememberToken };
		} else {
			updateData = { status: ACCOUNT_STATUS.ACTIVE, remember_token: null };
		}

		updateRecord = await prisma.users.update({
			where: { id: parseInt(id, 10) },
			data: updateData,
		});
		updateRecord = this.publicProfile(updateRecord);

		if (type === 'reset' && rememberToken) {
			updateRecord.resetToken = rememberToken;
		}

		return updateRecord;
	}

	async ResendOTP() {
		const { id } = this.req.params;
		const { query } = this.req;
		const type = query?.type && query.type === 'reset' ? 'reset' : 'verify';

		const updateRecord = await this.createOTP(id, type);

		return this.publicProfile(updateRecord);
	}

	// eslint-disable-next-line class-methods-use-this
	async createOTP(userID, type = 'verify') {
		const OTP = Math.floor(1000 + Math.random() * 9000);

		const rememberToken = createOtpToken({ userId: userID, OTP, type });
		const updateRecord = await prisma.users.update({
			where: {
				id: parseInt(userID, 10),
			},
			data: {
				remember_token: rememberToken,
			},
		});

		const mailOptions = {
			to: updateRecord.email,
			subject: 'OTP',
			text: 'Your One Time Password',
			html: `<p>Your one time password is ${OTP}.</p>`,
		};

		sendEmail(mailOptions);

		// updateRecord.OTP = OTP;

		return { ...updateRecord };
	}

	async ForgotPassword() {
		const { email } = this.req.body;

		const record = await prisma.users.findFirst({
			where: {
				deleted: false,
				email,
			},
		});

		const updateRecord = await this.createOTP(record.id, 'reset');

		return this.publicProfile(updateRecord);
	}

	async ResetPassword() {
		const { id } = this.req.params;
		const { password } = this.req.body;

		const passwordHash = await bcrypt.hash(password, 12);

		const updateRecord = await prisma.users.update({
			where: {
				id: parseInt(id, 10),
			},
			data: {
				password: passwordHash,
				remember_token: null,
			},
		});

		return this.publicProfile(updateRecord);
	}

	async changePassword() {
		const { id } = this.req.user;
		const { oldPassword, newPassword } = this.req.body;

		const user = await prisma.users.findUnique({
			where: { id: parseInt(id, 10) },
		});
		
		const isPasswordValid = await bcrypt.compare(oldPassword, user?.password);

		if (!isPasswordValid) throw new AppError(WRONG_OLD_PASSWORD, HttpStatus.BAD_REQUEST);


		const passwordHash = await bcrypt.hash(newPassword, 12);

		const updateRecord = await prisma.users.update({
			where: { id: parseInt(id, 10) },
			data: { password: passwordHash },
		});

		return this.publicProfile(updateRecord);
	}


	/* eslint-disable-next-line class-methods-use-this */
	publicProfile(user) {
		const record = { ...user };
		if (!record || !record.id)
			throw new AppError(USER_NOT_FOUND, HttpStatus.OK);

		if (record.password) delete record.password;
		if (record.remember_token) delete record.remember_token;

		return record;
	}
}
