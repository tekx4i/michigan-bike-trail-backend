-- AddForeignKey
ALTER TABLE `trails` ADD CONSTRAINT `trails_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
