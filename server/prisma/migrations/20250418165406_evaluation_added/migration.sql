/*
  Warnings:

  - You are about to drop the `Evaluation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_interviewId_fkey";

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "evaluation" JSONB;

-- DropTable
DROP TABLE "Evaluation";
