/*
  Warnings:

  - You are about to drop the column `feiranteId` on the `feira` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Feira` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `feira` DROP FOREIGN KEY `Feira_feiranteId_fkey`;

-- AlterTable
ALTER TABLE `feira` DROP COLUMN `feiranteId`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Feira` ADD CONSTRAINT `Feira_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
