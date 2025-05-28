import slugify from 'slugify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// export async function generateUniqueSlug(title) {
// 	const baseSlug = slugify(title, { lower: true, strict: true });
// 	let uniqueSlug = baseSlug;
// 	let count = 1;

// 	while (true) {
// 		const existing = await Prisma.trails.findUnique({
// 			where: {
// 				slug: uniqueSlug,
// 			},
// 		});

// 		if (!existing) break;

// 		uniqueSlug = `${baseSlug}-${count}`;
// 		count++;
// 	}

// 	return uniqueSlug;
// }

// export async function generateUniqueSlug(title, idToExclude) {
// 	const baseSlug = slugify(title, { lower: true, strict: true });
// 	let uniqueSlug = baseSlug;
// 	let count = 1;

// 	while (true) {
// 		const existing = await prisma.trails.findFirst({
// 			where: {
// 				slug: uniqueSlug,
// 				deleted: false,
// 				NOT: idToExclude ? { id: idToExclude } : undefined,
// 			},
// 		});

// 		if (!existing) break;

// 		uniqueSlug = `${baseSlug}-${count}`;
// 		count++;
// 	}

// 	return uniqueSlug;
// }

// Keep
export async function generateUniqueSlugAndTitle(baseTitle, idToExclude) {
	const baseSlug = slugify(baseTitle, { lower: true, strict: true });
	let slug = baseSlug;
	let title = baseTitle.trim();
	let count = 1;

	while (true) {
		const exists = await prisma.trails.findFirst({
			where: {
				slug,
				deleted: false,
				...(idToExclude ? { NOT: { id: idToExclude } } : {}),
			},
		});

		if (!exists) break;

		// Append counter
		slug = `${baseSlug}-${count}`;
		title = `${baseTitle}-${count}`;
		count++;
	}

	return { slug, title };
}
