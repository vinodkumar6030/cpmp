/**
 * patch-schema.js
 * Runs during Render build to ensure schema.prisma uses postgresql (for Supabase)
 * and migration_lock.toml matches.
 * This handles cases where the git repo still has the old mysql provider.
 */
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const lockPath = path.join(__dirname, '..', 'prisma', 'migrations', 'migration_lock.toml');
const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', '20260315161820_init', 'migration.sql');

// 1. Patch schema.prisma
let schema = fs.readFileSync(schemaPath, 'utf8');
if (schema.includes('provider  = "mysql"') || schema.includes('provider = "mysql"')) {
  schema = schema
    .replace(/provider\s*=\s*"mysql"/, 'provider  = "postgresql"')
    .replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")');
  // Remove duplicate directUrl if already present
  schema = schema.replace(/(directUrl = env\("DIRECT_URL"\)\s*\n)\s*directUrl = env\("DIRECT_URL"\)/, '$1');
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ schema.prisma patched to postgresql');
} else {
  console.log('✅ schema.prisma already uses postgresql');
}

// 2. Patch migration_lock.toml
if (fs.existsSync(lockPath)) {
  let lock = fs.readFileSync(lockPath, 'utf8');
  if (lock.includes('provider = "mysql"')) {
    lock = lock.replace('provider = "mysql"', 'provider = "postgresql"');
    fs.writeFileSync(lockPath, lock);
    console.log('✅ migration_lock.toml patched to postgresql');
  }
}

// 3. Rewrite migration SQL to PostgreSQL if it still has MySQL syntax
if (fs.existsSync(migrationPath)) {
  let sql = fs.readFileSync(migrationPath, 'utf8');
  if (sql.includes('AUTO_INCREMENT') || sql.includes('utf8mb4')) {
    const pgSql = `-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT,
    "year" TEXT,
    "phone" TEXT,
    "profilePhoto" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'user',
    "verifyToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sellerId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" INTEGER NOT NULL,
    "reportedBy" INTEGER NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;
    fs.writeFileSync(migrationPath, pgSql);
    console.log('✅ migration.sql patched to postgresql syntax');
  }
}

console.log('🚀 Schema patch complete — ready for prisma migrate deploy');
