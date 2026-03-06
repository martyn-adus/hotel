import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const defaultEmail = process.env.ADMIN_EMAIL;
  const defaultPassword = process.env.ADMIN_PASSWORD;

  if (!defaultEmail || !defaultPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });

  if (existingUser) {
    console.log('Admin user with this email already exists');
    console.log('Updating password...');

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await prisma.user.update({
      where: { email: defaultEmail },
      data: { password: hashedPassword },
    });

    console.log('Admin password updated successfully');
    console.log('Email:', defaultEmail);
    return;
  }

  const deletedCount = await prisma.user.deleteMany({});
  console.log(`Deleted ${deletedCount.count} existing user(s)`);

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const user = await prisma.user.create({
    data: {
      email: defaultEmail,
      password: hashedPassword,
    },
  });

  console.log('Admin user created:');
  console.log('Email:', defaultEmail);
  console.log('User ID:', user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
