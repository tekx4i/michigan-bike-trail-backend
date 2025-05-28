-- AlterTable
ALTER TABLE `trails` ADD COLUMN `updated_by` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `trails` ADD CONSTRAINT `trails_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
