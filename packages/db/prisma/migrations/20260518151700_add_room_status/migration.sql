-- CreateEnum
CREATE TYPE "room_status" AS ENUM ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "status" "room_status" NOT NULL DEFAULT 'AVAILABLE';
