-- CreateTable
CREATE TABLE `auth_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` ENUM('login', 'logout') NOT NULL DEFAULT 'login',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `aboutMe` VARCHAR(191) NULL,
    `units` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NULL,
    `number` VARCHAR(191) NULL,
    `password` TEXT NOT NULL,
    `remember_token` TEXT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_by` INTEGER NULL,
    `lat_long` VARCHAR(191) NULL,
    `postal_code` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `file_name` VARCHAR(191) NULL,
    `original_name` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `birth_date` DATE NULL,
    `last_login` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `description` TEXT NULL,
    `latitude` VARCHAR(191) NULL,
    `longitude` VARCHAR(191) NULL,
    `surfaceType` VARCHAR(191) NULL,
    `difficultyLevel` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL DEFAULT 'TRAIL',
    `location` VARCHAR(191) NULL,
    `trailDistance` DOUBLE NULL DEFAULT 0,
    `estimatedTime` VARCHAR(191) NULL,
    `trail_head_address` VARCHAR(191) NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `avgRating` DOUBLE NULL DEFAULT 0,
    `postal_code` VARCHAR(191) NULL,
    `ratingCounts` INTEGER NULL DEFAULT 0,
    `parentId` INTEGER NULL,
    `slug` VARCHAR(191) NULL,
    `activities` JSON NULL,
    `trailInfo` JSON NULL,
    `elevationGain` DOUBLE NULL DEFAULT 0,
    `trailAssociationId` INTEGER NULL,

    UNIQUE INDEX `trails_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavouriteTrails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `trailId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FavouriteTrails_userId_trailId_key`(`userId`, `trailId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GPXFile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trailId` INTEGER NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `creator` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `time` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Waypoint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gpxFileId` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `lat` DOUBLE NOT NULL,
    `lon` DOUBLE NOT NULL,
    `elevation` DOUBLE NULL,
    `time` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Track` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gpxFileId` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrackSegment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trackId` INTEGER NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lon` DOUBLE NOT NULL,
    `elevation` DOUBLE NULL,
    `time` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Route` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gpxFileId` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoutePoint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `routeId` INTEGER NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lon` DOUBLE NOT NULL,
    `elevation` DOUBLE NULL,
    `time` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trail_gallery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trail_id` INTEGER NOT NULL,
    `image` VARCHAR(191) NULL,
    `original_name` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rating` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trail_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `experience` VARCHAR(191) NULL,
    `difficulty` VARCHAR(191) NULL,
    `parkingLotSize` INTEGER NULL,
    `parkingCost` VARCHAR(191) NULL,
    `access` VARCHAR(191) NULL,
    `condition` VARCHAR(191) NULL,
    `activityType` VARCHAR(191) NULL,
    `dateVisited` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RatingImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating_id` INTEGER NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `original_name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `latitude` VARCHAR(191) NOT NULL,
    `longitude` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserFavoriteActivities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `backpacking` BOOLEAN NULL DEFAULT false,
    `cross_country_skiing` BOOLEAN NULL DEFAULT false,
    `horseback_riding` BOOLEAN NULL DEFAULT false,
    `snowshoeing` BOOLEAN NULL DEFAULT false,
    `mountain_biking` BOOLEAN NULL DEFAULT false,
    `skiing` BOOLEAN NULL DEFAULT false,
    `fishing` BOOLEAN NULL DEFAULT false,
    `running` BOOLEAN NULL DEFAULT false,
    `hiking` BOOLEAN NULL DEFAULT false,
    `birding` BOOLEAN NULL DEFAULT false,
    `camping` BOOLEAN NULL DEFAULT false,
    `scenic_driving` BOOLEAN NULL DEFAULT false,
    `off_road_driving` BOOLEAN NULL DEFAULT false,
    `via_ferrata` BOOLEAN NULL DEFAULT false,
    `rock_climbing` BOOLEAN NULL DEFAULT false,
    `road_biking` BOOLEAN NULL DEFAULT false,
    `walking` BOOLEAN NULL DEFAULT false,
    `bike_touring` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserFavoriteActivities_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrailAssociations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `regionName` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NULL,
    `original_name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phoneNo` VARCHAR(191) NULL,
    `lat` VARCHAR(191) NULL,
    `lng` VARCHAR(191) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auth_log` ADD CONSTRAINT `auth_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trails` ADD CONSTRAINT `trails_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `trails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trails` ADD CONSTRAINT `trails_trailAssociationId_fkey` FOREIGN KEY (`trailAssociationId`) REFERENCES `TrailAssociations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavouriteTrails` ADD CONSTRAINT `FavouriteTrails_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavouriteTrails` ADD CONSTRAINT `FavouriteTrails_trailId_fkey` FOREIGN KEY (`trailId`) REFERENCES `trails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GPXFile` ADD CONSTRAINT `GPXFile_trailId_fkey` FOREIGN KEY (`trailId`) REFERENCES `trails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Waypoint` ADD CONSTRAINT `Waypoint_gpxFileId_fkey` FOREIGN KEY (`gpxFileId`) REFERENCES `GPXFile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Track` ADD CONSTRAINT `Track_gpxFileId_fkey` FOREIGN KEY (`gpxFileId`) REFERENCES `GPXFile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackSegment` ADD CONSTRAINT `TrackSegment_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Route` ADD CONSTRAINT `Route_gpxFileId_fkey` FOREIGN KEY (`gpxFileId`) REFERENCES `GPXFile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoutePoint` ADD CONSTRAINT `RoutePoint_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trail_gallery` ADD CONSTRAINT `trail_gallery_trail_id_fkey` FOREIGN KEY (`trail_id`) REFERENCES `trails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_trail_id_fkey` FOREIGN KEY (`trail_id`) REFERENCES `trails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RatingImage` ADD CONSTRAINT `RatingImage_rating_id_fkey` FOREIGN KEY (`rating_id`) REFERENCES `rating`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFavoriteActivities` ADD CONSTRAINT `UserFavoriteActivities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
