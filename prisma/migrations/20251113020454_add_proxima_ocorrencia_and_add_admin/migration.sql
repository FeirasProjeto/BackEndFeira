/*
  Warnings:

  - You are about to drop the column `feirante` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Feira" ADD COLUMN     "proximaOcorrencia" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "feirante",
ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;
