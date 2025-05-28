import dotenv from 'dotenv';

const envFiles = {
	development: '.env.development',
	production: '.env.production',
	staging: '.env.staging',
};

dotenv.config({ path: envFiles[process.env.NODE_ENV] });

export const {
	NODE_ENV,
	PORT,
	ACCESS_TOKEN_SECRET,
	ACCESS_TOKEN_EXPIRY,
	OTP_TOKEN_SECRET,
	OTP_TOKEN_EXPIRY,
	RATE_LIMIT_WINDOW,
	RATE_LIMIT_MAX,
	CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET,
	CLOUDINARY_FOLDER,
	SMTP_PASS,
	FROM_NAME,
	FROM_EMAIL,
	ADMIN_EMAIL,
	SUPPORT_EMAIL,
	LIVE_URL,
	// SG_API_KEY,
	// SG_SENDER_EMAIL,
} = process.env;
