-- CreateEnum
CREATE TYPE "exam_category" AS ENUM ('CLASSROOM', 'MAJOR');

-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "exam_category" "exam_category" DEFAULT 'CLASSROOM';
