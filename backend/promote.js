const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'testing1@test.edu' },
    data: { role: 'admin', isVerified: true }
  });
  console.log('User promoted to Admin and Verified successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
