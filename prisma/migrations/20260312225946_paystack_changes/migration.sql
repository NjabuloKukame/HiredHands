/*
  Warnings:

  - You are about to drop the column `payfastMerchantId` on the `ProviderProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProviderProfile" DROP COLUMN "payfastMerchantId",
ADD COLUMN     "payStackMerchantId" TEXT;
