-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN     "address" TEXT,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "newProviders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "smsNotifications" BOOLEAN NOT NULL DEFAULT false;
