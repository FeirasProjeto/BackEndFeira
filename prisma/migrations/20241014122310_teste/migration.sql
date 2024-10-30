/*
  Warnings:

  - You are about to drop the `_diasemanatofeira` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_diasemanatofeira` DROP FOREIGN KEY `_DiaSemanaToFeira_A_fkey`;

-- DropForeignKey
ALTER TABLE `_diasemanatofeira` DROP FOREIGN KEY `_DiaSemanaToFeira_B_fkey`;

-- DropTable
DROP TABLE `_diasemanatofeira`;

-- CreateTable
CREATE TABLE `diaSemanaFeira` (
    `diaSemanaId` VARCHAR(191) NOT NULL,
    `feiraId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`diaSemanaId`, `feiraId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `diaSemanaFeira` ADD CONSTRAINT `diaSemanaFeira_feiraId_fkey` FOREIGN KEY (`feiraId`) REFERENCES `Feira`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diaSemanaFeira` ADD CONSTRAINT `diaSemanaFeira_diaSemanaId_fkey` FOREIGN KEY (`diaSemanaId`) REFERENCES `diaSemana`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
