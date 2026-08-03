/*
  Warnings:

  - You are about to drop the column `department` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employeeEmail` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employeeName` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `lastWorkingDay` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the `Approval` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `emailId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slNo` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GuruDecision" AS ENUM ('DELETE', 'RETAIN', 'HOLD');

-- CreateEnum
CREATE TYPE "ITStatus" AS ENUM ('PENDING', 'STARTED_DOWNLOAD', 'DELETED', 'HOLD', 'COMPLETED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PARTNER';

-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_directorId_fkey";

-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_employeeId_fkey";

-- DropIndex
DROP INDEX "Employee_employeeId_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "department",
DROP COLUMN "employeeEmail",
DROP COLUMN "employeeId",
DROP COLUMN "employeeName",
DROP COLUMN "lastWorkingDay",
DROP COLUMN "status",
ADD COLUMN     "emailId" TEXT NOT NULL,
ADD COLUMN     "guruCommentEmail" "GuruDecision",
ADD COLUMN     "guruCommentOneDrive" "GuruDecision",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "partnerCommentEmail" TEXT,
ADD COLUMN     "partnerCommentOneDrive" TEXT,
ADD COLUMN     "slNo" INTEGER NOT NULL,
ADD COLUMN     "statusByIT" "ITStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "team" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Approval";

-- DropEnum
DROP TYPE "Decision";

-- DropEnum
DROP TYPE "EmployeeStatus";
