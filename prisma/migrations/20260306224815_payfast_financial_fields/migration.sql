-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "gatewayFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentType" TEXT,
ADD COLUMN     "payoutAmount" DOUBLE PRECISION,
ADD COLUMN     "payoutFiredAt" TIMESTAMP(3),
ADD COLUMN     "payoutReference" TEXT,
ADD COLUMN     "payoutRetries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "payoutStatus" TEXT,
ADD COLUMN     "pfPaymentId" TEXT,
ADD COLUMN     "pfPaymentToken" TEXT,
ADD COLUMN     "pinAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pinExpiresAt" TIMESTAMP(3),
ADD COLUMN     "pinGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "pinLockedUntil" TIMESTAMP(3),
ADD COLUMN     "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalCharged" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "verificationPin" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "currency" SET DEFAULT 'ZAR';

-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN     "payfastMerchantId" TEXT;
