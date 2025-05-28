// import multer from 'multer';
// import { ulid } from 'ulid';

// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'temp_uploads/');
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, `${ulid()}.${file.originalname.split('.').pop()}`);
// 	},
// });

// export const upload = multer({
// 	storage,
// 	fileFilter: (_req, file, cb) => {
// 		const [fileType, _fileSubtype] = file.mimetype.split('/');
// 		cb(null, true);
// 		// if (fileType === 'image') {
// 		// } else {
// 		// 	// cb(new Error('File format not supported'), false);
// 		// }
// 	},
// });

// worked!
// import multer from 'multer';
// import { ulid } from 'ulid';

// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'temp_uploads/');
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, `${ulid()}.${file.originalname.split('.').pop()}`);
// 	},
// });

// export const upload = multer({
// 	storage,
// 	limits: {
// 		fileSize: 5 * 1024 * 1024, // 5MB max per image
// 		files: 5, // Maximum 5 images per request
// 	},
// 	fileFilter: (_req, file, cb) => {
// 		const [fileType, _fileSubtype] = file.mimetype.split('/');
// 		cb(null, true);
// 		// if (fileType === 'image') {
// 		// 	cb(null, true);
// 		// } else {
// 		// 	cb(new Error('Only image files are allowed'), false);
// 		// }
// 	},
// });

// new one
import multer from 'multer';
import { ulid } from 'ulid';
import path from 'path';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'temp_uploads/');
	},
	filename: (req, file, cb) => {
		cb(null, `${ulid()}${path.extname(file.originalname)}`);
	},
});

export const upload = multer({
	storage,
	limits: {
		fileSize: 20 * 1024 * 1024, // Max 5MB per file
		// files: 5, // Max 5 files
	},
	fileFilter: (_req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();

		// Define allowed extensions for each field
		const allowedExtensions = {
			file: ['.gpx'], // Only GPX files
			files: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'], // Only image files
		};

		if (file.fieldname === 'file' && allowedExtensions.file.includes(ext)) {
			return cb(null, true);
		}

		if (file.fieldname === 'files' && allowedExtensions.files.includes(ext)) {
			return cb(null, true);
		}
		if (file.fieldname === 'image' && allowedExtensions.files.includes(ext)) {
			// console.log('Accepted!!');
			return cb(null, true);
		}

		return cb(new Error(`Invalid file type: ${file.originalname}`));
	},
});

// Handle both single and multiple file uploads
export const uploadMiddleware = upload.fields([
	{ name: 'file', maxCount: 1 }, // Only 1 GPX file
	// { name: 'files', maxCount: 5 }, // Up to 5 images
	{ name: 'files' }, // Up to 5 images
	{ name: 'image', maxCount: 1 }, // Up to 5 images
]);
