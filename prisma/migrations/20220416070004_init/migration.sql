-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('IMPORTED', 'MANUAL');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "source" "TransactionSource" NOT NULL DEFAULT E'IMPORTED';
