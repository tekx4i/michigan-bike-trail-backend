import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdmin() {
	const password = await bcrypt.hash('Admin@123', 12); // You can customize this
	const email = 'admin@gmail.com';

	const existingAdmin = await prisma.users.findUnique({
		where: { email },
	});

	if (existingAdmin?.deleted) {
		await prisma.users.update({
			where: { email, role_id: 1 },
			data: { deleted: false, status: 'ACTIVE' },
		});
		console.log('Admin user restored successfully:', email);
		return;
	}

	if (existingAdmin) {
		console.log('Admin already exists.');
		return;
	}

	const admin = await prisma.users.create({
		data: {
			firstName: 'Yodo',
			lastName: 'Design',
			email,
			password,
			role_id: 1, // or however you define admin in your enum/roles
			status: 'ACTIVE',
			created_by: null, // No user is creating this
		},
	});

	await prisma.userFavoriteActivities.create({
		data: { user_id: admin.id },
	});

	console.log('✅ Admin user created successfully:', admin.email);
}
