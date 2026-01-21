import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const defaultEmail = 'admin@hotel.com';
  const defaultPassword = 'admin123';

  // Check if default user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });

  if (existingUser) {
    console.log('Default admin user already exists');
    return;
  }

  // Create default admin user
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const user = await prisma.user.create({
    data: {
      email: defaultEmail,
      password: hashedPassword,
    },
  });

  console.log('Default admin user created:');
  console.log('Email:', defaultEmail);
  console.log('Password:', defaultPassword);
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
