/*
  Warnings:

  - You are about to drop the column `donorId` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nationalId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campaignType` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thankYouMessage` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `walletType` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `governorate` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationalId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GazaGovernorate" AS ENUM ('GAZA', 'NORTH_GAZA', 'KHAN_YUNIS', 'RAFAH', 'DEIR_AL_BALAH');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('Family', 'Community', 'Education', 'Emergencies', 'Events', 'Medical', 'Volunteer', 'Other');

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_donorId_fkey";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "campaignType" "CampaignType" NOT NULL,
ADD COLUMN     "donorCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "otherSocialLinks" JSONB,
ADD COLUMN     "thankYouMessage" VARCHAR(200) NOT NULL,
ADD COLUMN     "tiktokUrl" TEXT,
ADD COLUMN     "videoLinks" JSONB;

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "donorId",
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "donorMessage" TEXT,
ADD COLUMN     "donorName" TEXT,
ADD COLUMN     "signature" TEXT,
ADD COLUMN     "solSignature" TEXT,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "walletType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "governorate" "GazaGovernorate" NOT NULL,
ADD COLUMN     "nationalId" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "thumbnailUrl" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nationalId_key" ON "User"("nationalId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
