-- CreateTable
CREATE TABLE `diaSemana` (
    `id` VARCHAR(36) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DiaSemanaToFeira` (
    `A` VARCHAR(36) NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_DiaSemanaToFeira_AB_unique`(`A`, `B`),
    INDEX `_DiaSemanaToFeira_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_DiaSemanaToFeira` ADD CONSTRAINT `_DiaSemanaToFeira_A_fkey` FOREIGN KEY (`A`) REFERENCES `diaSemana`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DiaSemanaToFeira` ADD CONSTRAINT `_DiaSemanaToFeira_B_fkey` FOREIGN KEY (`B`) REFERENCES `Feira`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
