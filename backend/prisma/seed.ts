import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Missing required admin credentials: Both ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env'
    );
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: Role.REVIEWER,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: Role.REVIEWER,
    },
  });

  console.log(`Admin user successfully seeded: ${admin.email} [Role: ${admin.role}]`);
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
