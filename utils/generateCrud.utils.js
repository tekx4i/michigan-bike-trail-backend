import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import { fileURLToPath } from 'url';

const generateCrud = (req, res) => {
	const crudName = 'rating';
	const replacements = ['Rating', 'RATING', 'rating', '.ratings.'];
	const folders = [
		'constants',
		'controllers',
		'routes',
		'validations',
		'services',
	];

	folders.forEach(folder => {
		const sourceFilePath = path.join(__dirname, folder, `role.${folder}.js`);
		const destinationFileName = `${crudName}.${folder}.js`;
		const destinationFilePath = path.join(
			__dirname,
			folder,
			destinationFileName,
		);
		const indexFilePath = path.join(__dirname, folder, 'index.js');

		fs.copyFile(sourceFilePath, destinationFilePath, err => {
			if (err) {
				console.error(`Error copying file in ${folder}:`, err);
			} else {
				console.log(`File copied in ${folder} as ${destinationFileName}`);

				fs.readFile(destinationFilePath, 'utf8', (readErr, data) => {
					if (readErr) {
						console.error(`Error reading file in ${folder}:`, readErr);
					} else {
						const updatedContent = data
							.replace(/Role/g, replacements[0])
							.replace(/ROLE/g, replacements[1])
							.replace(/role/g, replacements[2])
							.replace(/\.roles\./g, replacements[3]);

						fs.writeFile(
							destinationFilePath,
							updatedContent,
							'utf8',
							writeErr => {
								if (writeErr) {
									console.error(`Error writing file in ${folder}:`, writeErr);
								} else {
									console.log(`File updated in ${folder} with replacements`);

									const exportLine = `export * from './${crudName}.${folder}';\n`;
									fs.appendFile(indexFilePath, exportLine, appendErr => {
										if (appendErr) {
											console.error(
												`Error appending to index.js in ${folder}:`,
												appendErr,
											);
										} else {
											console.log(`Export line added to index.js in ${folder}`);
										}
									});
								}
							},
						);
					}
				});
			}
		});
	});

	res.status(200).json({
		data: 'Files copied, updated, and export line added successfully',
	});
};

// export default generateCrud;
