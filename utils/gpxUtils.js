// With Streams
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import gpxParse from 'gpx-parse';

const prisma = new PrismaClient();

export const parseAndSaveGPX = async (filePath, originalFileName, trailId) => {
	try {
		// Step 1: Create a readable stream to read the GPX file
		const readableStream = fs.createReadStream(filePath, 'utf8');

		let fileData = '';

		// Step 2: Read the data in chunks and accumulate it
		readableStream.on('data', chunk => {
			fileData += chunk; // Accumulate the chunks
		});

		let initLat = 0;
		let initLon = 0;
		// Step 3: When the stream ends, parse the accumulated data
		readableStream.on('end', async () => {
			// Once the stream ends, parse the accumulated data
			gpxParse.parseGpx(fileData, async (error, parsedData) => {
				if (error) {
					console.error('Error parsing GPX file:', error);
					return;
				}

				// Extract relevant data from parsed GPX
				const { metadata, waypoints, tracks, routes } = parsedData;

				// Save GPX File metadata
				const gpxFile = await prisma.gPXFile.create({
					data: {
						creator: metadata.creator,
						filePath: filePath,
						originalName: originalFileName,
						trailId: trailId,
						time: metadata.time ? new Date(metadata.time) : null,
					},
				});

				// Save Waypoints
				if (waypoints.length > 0) {
					await prisma.waypoint.createMany({
						data: waypoints.map(w => ({
							gpxFileId: gpxFile.id,
							name: w.name || null,
							lat: w.lat,
							lon: w.lon,
							elevation: w.elevation || null,
							time: w.time ? new Date(w.time) : null,
						})),
					});
				}

				// Save Tracks and Track Segments
				for (const track of tracks) {
					const savedTrack = await prisma.track.create({
						data: {
							gpxFileId: gpxFile.id,
							name: track.name || null,
						},
					});

					// Save Track Segments
					if (track.segments.length > 0) {
						const segmentsData = track.segments.flat().map(seg => ({
							trackId: savedTrack.id,
							lat: seg.lat,
							lon: seg.lon,
							elevation: seg.elevation || null,
							time: seg.time ? new Date(seg.time) : null,
						}));

						await prisma.trackSegment.createMany({ data: segmentsData });
					}
				}

				// Save Routes and Route Points
				for (const route of routes) {
					const savedRoute = await prisma.route.create({
						data: {
							gpxFileId: gpxFile.id,
							name: route.name || null,
						},
					});

					// Save Route Points
					if (route.points.length > 0) {
						const routePointsData = route.points.map(point => ({
							routeId: savedRoute.id,
							lat: point.lat,
							lon: point.lon,
							elevation: point.elevation || null,
							time: point.time ? new Date(point.time) : null,
						}));

						// console.warn('routePointsData:', routePointsData);
						initLat = routePointsData[0].lat;
						initLon = routePointsData[0].lon;

						console.log('initLat:', initLat);
						console.log('initLon:', initLon);
						await prisma.trails.update({
							where: { id: trailId },
							data: {
								latitude: initLat.toString(),
								longitude: initLon.toString(),
								// Add other fields if needed
							},
						});
						await prisma.routePoint.createMany({ data: routePointsData });
					}
				}

				console.log('GPX Data successfully saved!');
			});
		});

		// Step 4: Error handling for the stream
		readableStream.on('error', err => {
			console.error('Error reading the file stream:', err);
		});
	} catch (err) {
		console.error('Error processing GPX file:', err);
	}
};

// Worked but Without streams
// import fs from 'fs';
// import path from 'path';
// import { PrismaClient } from '@prisma/client';
// import gpxParse from 'gpx-parse';

// const prisma = new PrismaClient();

// export const parseAndSaveGPX = async (filePath, originalFileName, trailId) => {

//     try {
//         // Step 1: Read the GPX file from disk
//         const fileData = fs.readFileSync(filePath, 'utf8');
//         // Step 2: Parse the GPX file
//         gpxParse.parseGpx(fileData, async (error, parsedData) => {
//             if (error) {
//                 console.error('Error parsing GPX file:', error);
//                 return;
//             }

//             // Extract JSON string
//             const extractData = JSON.stringify(parsedData, null, 2);

//             // Parse extracted data back to an object
//             const parsedExtractedData = JSON.parse(extractData);

//             // console.log('Parsed Extracted Data:', parsedExtractedData);

//             // // worked tracks with segments
//             // console.log('Parsed Segments Data:', parsedExtractedData.tracks[0].segments);

//             // // worked waypoints
//             // console.log('Parsed Waypoints Data:', parsedExtractedData.waypoints);

//             // // worked routes with points
//             // console.log('Parsed Routes Data:', parsedExtractedData.routes[0].points);

//             // new
//             const { metadata, waypoints, tracks, routes } = parsedExtractedData;

//             // Save GPX File metadata
//             const gpxFile = await prisma.gPXFile.create({
//                 data: {
//                     creator: metadata.creator,
//                     name: metadata.name || null,
//                     filePath: filePath,
//                     originalName: originalFileName,
//                     trailId: trailId,
//                     time: metadata.time ? new Date(metadata.time) : null,
//                 },
//             });

//             // Save Waypoints
//             if (waypoints.length > 0) {
//                 await prisma.waypoint.createMany({
//                     data: waypoints.map((w) => ({
//                         gpxFileId: gpxFile.id,
//                         name: w.name || null,
//                         lat: w.lat,
//                         lon: w.lon,
//                         elevation: w.elevation || null,
//                         time: w.time ? new Date(w.time) : null,
//                     })),
//                 });
//             }

//             // Save Tracks and Track Segments
//             for (const track of tracks) {
//                 const savedTrack = await prisma.track.create({
//                     data: {
//                         gpxFileId: gpxFile.id,
//                         name: track.name || null,
//                     },
//                 });

//                 // Save Track Segments
//                 if (track.segments.length > 0) {
//                     const segmentsData = track.segments.flat().map((seg) => ({
//                         trackId: savedTrack.id,
//                         lat: seg.lat,
//                         lon: seg.lon,
//                         elevation: seg.elevation || null,
//                         time: seg.time ? new Date(seg.time) : null,
//                     }));

//                     await prisma.trackSegment.createMany({ data: segmentsData });
//                 }
//             }

//             // Save Routes and Route Points
//             for (const route of routes) {
//                 const savedRoute = await prisma.route.create({
//                     data: {
//                         gpxFileId: gpxFile.id,
//                         name: route.name || null,
//                     },
//                 });

//                 // Save Route Points
//                 if (route.points.length > 0) {
//                     const routePointsData = route.points.map((point) => ({
//                         routeId: savedRoute.id,
//                         lat: point.lat,
//                         lon: point.lon,
//                         elevation: point.elevation || null,
//                         time: point.time ? new Date(point.time) : null,
//                     }));

//                     await prisma.routePoint.createMany({ data: routePointsData });
//                 }
//             }

//             console.log('GPX Data successfully saved!');

//         });
//     } catch (err) {
//         console.error('Error processing GPX file:', err);
//     }
// };
