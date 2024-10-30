/*
  Warnings:

  - You are about to drop the column `Feiranteid` on the `feira` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `feira` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `feira` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `feira` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `feira` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `feira` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `feira` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - Added the required column `cidade` to the `Feira` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endereco` to the `Feira` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feiranteId` to the `Feira` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Feira` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `Feira` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `feira` DROP FOREIGN KEY `Feira_Feiranteid_fkey`;

-- AlterTable
ALTER TABLE `feira` DROP COLUMN `Feiranteid`,
    DROP COLUMN `address`,
    DROP COLUMN `city`,
    DROP COLUMN `description`,
    DROP COLUMN `image`,
    DROP COLUMN `name`,
    DROP COLUMN `number`,
    ADD COLUMN `cidade` VARCHAR(191) NOT NULL,
    ADD COLUMN `data` DATETIME(3) NULL,
    ADD COLUMN `descricao` VARCHAR(191) NULL,
    ADD COLUMN `endereco` VARCHAR(191) NOT NULL,
    ADD COLUMN `feiranteId` VARCHAR(191) NOT NULL,
    ADD COLUMN `imagem` VARCHAR(191) NULL,
    ADD COLUMN `nome` VARCHAR(191) NOT NULL,
    ADD COLUMN `numero` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tag` DROP COLUMN `name`,
    ADD COLUMN `nome` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `name`,
    ADD COLUMN `nome` VARCHAR(191) NOT NULL,
    MODIFY `feirante` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `Feira` ADD CONSTRAINT `Feira_feiranteId_fkey` FOREIGN KEY (`feiranteId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
