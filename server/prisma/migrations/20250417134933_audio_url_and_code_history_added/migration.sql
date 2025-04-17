/*
  Warnings:

  - You are about to drop the column `candidateCode` on the `Interview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "candidateCode",
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "codeHistory" JSONB[] DEFAULT ARRAY[]::JSONB[];
