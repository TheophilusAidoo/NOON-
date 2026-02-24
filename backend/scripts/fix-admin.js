/**
 * Fix admin user - run: node scripts/fix-admin.js
 * Ensures admin@noonshop.com has role ADMIN and password Admin@123
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@noonshop.com' },
    update: { password, role: 'ADMIN', isVerified: true },
    create: {
      name: 'Admin',
      email: 'admin@noonshop.com',
      password,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Admin ready:', admin.email);
  console.log('  Role:', admin.role);
  console.log('  Password: Admin@123');
  console.log('\nLogin at /login with these credentials.');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
