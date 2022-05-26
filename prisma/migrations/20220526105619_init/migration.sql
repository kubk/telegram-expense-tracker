-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "shortId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "shortId" SERIAL NOT NULL;
