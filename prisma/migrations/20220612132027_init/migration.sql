-- CreateTable
CREATE TABLE "FilterTransactionName" (
    "name" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,

    CONSTRAINT "FilterTransactionName_pkey" PRIMARY KEY ("name","bankAccountId")
);

-- AddForeignKey
ALTER TABLE "FilterTransactionName" ADD CONSTRAINT "FilterTransactionName_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
