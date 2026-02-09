-- AlterTable
ALTER TABLE "room_types" ADD COLUMN     "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
