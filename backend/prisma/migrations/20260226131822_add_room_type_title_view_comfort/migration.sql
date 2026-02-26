/*
  Warnings:

  - Added the required column `updatedAt` to the `booking_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `room_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booking_requests" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "room_types" ADD COLUMN     "comfort" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "view" TEXT[] DEFAULT ARRAY[]::TEXT[];
