/*
  Warnings:

  - You are about to drop the column `categoriaId` on the `Feira` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Feira" DROP CONSTRAINT "Feira_categoriaId_fkey";

-- AlterTable
ALTER TABLE "Feira" DROP COLUMN "categoriaId";
