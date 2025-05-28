import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRoles() {
    try {
        const roles = [
            { name: 'ADMIN', description: 'Administrator with full access' },
            { name: 'USER', description: 'Regular user with limited access' }
        ];

        for (const role of roles) {
            await prisma.roles.upsert({
                where: { name: role.name },
                update: {}, // Do nothing if it exists
                create: role, // Create only if it doesn't exist
            });
        }

        console.log('✅ Default roles inserted or already exist.');
    } catch (error) {
        console.error('❌ Error inserting roles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function
// seedRoles();
