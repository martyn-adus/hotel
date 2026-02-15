-- AlterTable
ALTER TABLE "booking_requests" ADD COLUMN     "roomTypeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "room_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
