/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `ServiceOrder` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TenantStatus" ADD VALUE 'PENDING_ACTIVATION';
ALTER TYPE "TenantStatus" ADD VALUE 'SUSPENDED';

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropIndex
DROP INDEX "ServiceOrder_tenantId_createdAt_idx";

-- DropIndex
DROP INDEX "ServiceOrder_tenantId_status_scheduledAt_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_tenantId_isActive_idx";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "ServiceOrder" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "trialStartedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING_ACTIVATION';

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "deletedAt";

-- DropTable
DROP TABLE "AuditLog";
