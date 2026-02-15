-- CreateEnum
CREATE TYPE "BookingRequestStatus" AS ENUM ('pending', 'processed', 'confirmed', 'declined');

-- AlterTable
ALTER TABLE "booking_requests" ADD COLUMN     "status" "BookingRequestStatus" NOT NULL DEFAULT 'pending';
