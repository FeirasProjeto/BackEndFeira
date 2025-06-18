/*
  Warnings:

  - You are about to drop the column `horario` on the `Feira` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Feira" DROP COLUMN "horario",
ADD COLUMN     "horarioFim" TEXT NOT NULL DEFAULT '00:00',
ADD COLUMN     "horarioInicio" TEXT NOT NULL DEFAULT '00:00',
ADD COLUMN     "turno" TEXT NOT NULL DEFAULT 'Não informado';
