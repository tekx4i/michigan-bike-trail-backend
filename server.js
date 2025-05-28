// Without cluster module
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import responseTime from 'response-time';

import { PORT } from './config';
import {
	errorMiddleware,
	notFound,
	// rateLimiter
} from './middlewares';
import {
	AuthRoutes,
	RatingRoutes,
	RoleRoutes,
	TrailAssociationsRoutes,
	TrailRoutes,
	UserRoutes,
} from './routes';
import { seedRoles } from './prisma/prismaRoleSeed';
import { seedAdmin } from './prisma/seedAdmin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(rateLimiter);
app.use(compression());
app.use(morgan('dev'));
app.use(responseTime());

// app.use(cors({ origin: '*' }));
app.use(cors());

// // Define the rate limiting middleware
// const limiter = rateLimit({
// 	windowMs: 60 * 1000, // 1 minute window
// 	max: 1,            // Limit each IP to 100 requests per window
// 	message: 'Too many requests from this IP, please try again later.',
// 	keyGenerator: (req) => req.ip, // Use the IP address to limit requests
// 	skipFailedRequests: true,      // Optional: Skip failed requests
// });

// // Apply rate limiting to all routes
// app.use(limiter);

app.use('/public', express.static(path.join(path.resolve(), 'temp_uploads')));
app.use(express.static(path.join(path.resolve(), 'public')));

app.use(helmet());

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/role', RoleRoutes);
app.use('/api/v1/trails', TrailRoutes);
app.use('/api/v1/rating', RatingRoutes);
app.use('/api/v1/associations', TrailAssociationsRoutes);

app.get('/home', (req, res) => {
	res.status(200).json({ data: 'Server is running' });
});

// app.get('/generateCrud', (req, res) => {
// 	const crudName = 'trailAssociations';
// 	const replacements = [
// 		'TrailAssociations',
// 		'TRAILASSOCIATION',
// 		'trailAssociations',
// 		'.trailsAssociations.',
// 	];
// 	const folders = [
// 		'constants',
// 		'controllers',
// 		'routes',
// 		'validations',
// 		'services',
// 	];

// 	folders.forEach(folder => {
// 		const sourceFilePath = path.join(__dirname, folder, `role.${folder}.js`);
// 		const destinationFileName = `${crudName}.${folder}.js`;
// 		const destinationFilePath = path.join(
// 			__dirname,
// 			folder,
// 			destinationFileName,
// 		);
// 		const indexFilePath = path.join(__dirname, folder, 'index.js');

// 		fs.copyFile(sourceFilePath, destinationFilePath, err => {
// 			if (err) {
// 				console.error(`Error copying file in ${folder}:`, err);
// 			} else {
// 				console.log(`File copied in ${folder} as ${destinationFileName}`);

// 				fs.readFile(destinationFilePath, 'utf8', (readErr, data) => {
// 					if (readErr) {
// 						console.error(`Error reading file in ${folder}:`, readErr);
// 					} else {
// 						const updatedContent = data
// 							.replace(/Role/g, replacements[0])
// 							.replace(/ROLE/g, replacements[1])
// 							.replace(/role/g, replacements[2])
// 							.replace(/\.roles\./g, replacements[3]);

// 						fs.writeFile(
// 							destinationFilePath,
// 							updatedContent,
// 							'utf8',
// 							writeErr => {
// 								if (writeErr) {
// 									console.error(`Error writing file in ${folder}:`, writeErr);
// 								} else {
// 									console.log(`File updated in ${folder} with replacements`);

// 									const exportLine = `export * from './${crudName}.${folder}';\n`;
// 									fs.appendFile(indexFilePath, exportLine, appendErr => {
// 										if (appendErr) {
// 											console.error(
// 												`Error appending to index.js in ${folder}:`,
// 												appendErr,
// 											);
// 										} else {
// 											console.log(`Export line added to index.js in ${folder}`);
// 										}
// 									});
// 								}
// 							},
// 						);
// 					}
// 				});
// 			}
// 		});
// 	});

// 	res.status(200).json({
// 		data: 'Files copied, updated, and export line added successfully',
// 	});
// });

app.use('*', notFound);
app.use(errorMiddleware);

if (!fs.existsSync('./temp_uploads')) {
	fs.mkdirSync('./temp_uploads', { recursive: true });
	// eslint-disable-next-line no-console
	console.log('temp_uploads folder created!');
}

// app.listen(PORT || 3000, () => {
// 	// eslint-disable-next-line no-console
// 	console.log(`Server is listening at port ${PORT}`);
// });

async function startServer() {
	await seedRoles(); // Run the seed function before starting the server
	await seedAdmin();

	app.listen(PORT || 3000, () => {
		console.log(`🚀 Server is listening at port ${PORT}`);
	});
}

startServer();

// Using Cluster Module
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import compression from 'compression';
// import cors from 'cors';
// import express from 'express';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import responseTime from 'response-time';
// import cluster from 'cluster';
// import os from 'os';

// import { PORT } from './config';
// import { errorMiddleware, notFound } from './middlewares';
// import {
// 	AuthRoutes,
// 	RatingRoutes,
// 	RoleRoutes,
// 	TrailRoutes,
// 	UserRoutes,
// } from './routes';
// import { seedRoles } from './prisma/prismaRoleSeed';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const numCPUs = os.cpus().length;

// if (cluster.isPrimary) {
// 	// Primary process (master) - creates workers
// 	console.log(`Primary process ${process.pid} is running`);

// 	// Fork workers for each CPU core
// 	for (let i = 0; i < numCPUs; i++) {
// 		cluster.fork();
// 	}

// 	// Monitor worker processes and restart if they die
// 	cluster.on('exit', (worker, code, signal) => {
// 		console.log(`Worker ${worker.process.pid} died. Restarting...`);
// 		cluster.fork(); // Fork a new worker
// 	});
// } else {
// 	// Worker processes run the Express server
// 	const app = express();
// 	app.use(express.json());
// 	app.use(express.urlencoded({ extended: true }));
// 	app.use(compression());
// 	app.use(morgan('dev'));
// 	app.use(responseTime());
// 	app.use(cors());
// 	app.use(helmet());

// 	app.use('/public', express.static(path.join(path.resolve(), 'temp_uploads')));
// 	app.use(express.static(path.join(path.resolve(), 'public')));

// 	app.use('/api/v1/auth', AuthRoutes);
// 	app.use('/api/v1/user', UserRoutes);
// 	app.use('/api/v1/role', RoleRoutes);
// 	app.use('/api/v1/trails', TrailRoutes);
// 	app.use('/api/v1/rating', RatingRoutes);

// 	app.get('/home', (req, res) => {
// 		res.status(200).json({ data: 'Server is running' });
// 	});

// 	app.use('*', notFound);
// 	app.use(errorMiddleware);

// 	if (!fs.existsSync('./temp_uploads')) {
// 		fs.mkdirSync('./temp_uploads', { recursive: true });
// 		console.log('temp_uploads folder created!');
// 	}

// 	// Run the seed function before starting the server
// 	async function startServer() {
// 		await seedRoles(); // Seed roles before starting the server

// 		app.listen(PORT || 3000, () => {
// 			console.log(`🚀 Worker ${process.pid} is listening at port ${PORT || 3000}`);
// 		});
// 	}

// 	startServer();
// }
