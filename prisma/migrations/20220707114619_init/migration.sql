-- CreateEnum
CREATE TYPE "TransactionImportRuleType" AS ENUM ('MakeUncountable', 'FilterTransactionName');

-- AlterTable
ALTER TABLE "FilterTransactionName" ADD COLUMN     "type" "TransactionImportRuleType" NOT NULL DEFAULT E'FilterTransactionName';
