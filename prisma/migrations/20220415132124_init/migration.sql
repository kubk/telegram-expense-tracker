/*
  Warnings:

  - The required column `id` was added to the `TelegramProfile` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `state` to the `TelegramProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TelegramProfile" ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD CONSTRAINT "TelegramProfile_pkey" PRIMARY KEY ("id");
