import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test users...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const petugasPassword = await bcrypt.hash('petugas123', 10);

  // Create Admin user
  const adminUser = await prisma.user.upsert({
    where: { petugasId: 'ADMIN001' },
    update: {},
    create: {
      role: 'ADMIN',
      petugasId: 'ADMIN001',
      nama: 'Admin User',
      noTelp: '+6281234567891',
      aktif: true,
      passwordHash: adminPassword,
    },
  });

  // Create Petugas user
  const petugasUser = await prisma.user.upsert({
    where: { petugasId: 'PETUGAS001' },
    update: {},
    create: {
      role: 'PETUGAS',
      petugasId: 'PETUGAS001',
      nama: 'Petugas User',
      noTelp: '+6281234567892',
      aktif: true,
      passwordHash: petugasPassword,
    },
  });

  console.log(`Admin user created: ${adminUser.nama} (ID: ${adminUser.petugasId})`);
  console.log(`Petugas user created: ${petugasUser.nama} (ID: ${petugasUser.petugasId})`);
  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });