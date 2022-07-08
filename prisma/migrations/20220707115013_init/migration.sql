-- AlterTable
ALTER TABLE "TransactionImportRule" RENAME CONSTRAINT "FilterTransactionName_pkey" TO "TransactionImportRule_pkey";

-- RenameForeignKey
ALTER TABLE "TransactionImportRule" RENAME CONSTRAINT "FilterTransactionName_bankAccountId_fkey" TO "TransactionImportRule_bankAccountId_fkey";
