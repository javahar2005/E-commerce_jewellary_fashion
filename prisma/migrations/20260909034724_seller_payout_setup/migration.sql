-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "payoutAccountName" TEXT,
ADD COLUMN     "payoutAccountNumber" TEXT,
ADD COLUMN     "payoutIfsc" TEXT,
ADD COLUMN     "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false;
