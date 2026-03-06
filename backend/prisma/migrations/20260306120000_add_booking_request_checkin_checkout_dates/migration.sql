-- AlterTable
ALTER TABLE "booking_requests"
  ADD COLUMN "checkInDate" TIMESTAMP(3),
  ADD COLUMN "checkOutDate" TIMESTAMP(3);
