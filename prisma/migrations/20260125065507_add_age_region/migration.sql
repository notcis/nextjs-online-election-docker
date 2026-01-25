/*
  Warnings:

  - Added the required column `age` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Member` ADD COLUMN `age` INTEGER NOT NULL,
    ADD COLUMN `isEligible` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `region` VARCHAR(50) NOT NULL;

-- CreateTable
CREATE TABLE `SystemSetting` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'global-settings',
    `isSystemActive` BOOLEAN NOT NULL DEFAULT true,
    `totalMembersCount` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
