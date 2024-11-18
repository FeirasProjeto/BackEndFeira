/*
  Warnings:

  - You are about to drop the column `localizacao` on the `Feira` table. All the data in the column will be lost.
  - Added the required column `coordenada` to the `Feira` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feira" DROP COLUMN "localizacao",
ADD COLUMN     "coordenada" TEXT NOT NULL;
