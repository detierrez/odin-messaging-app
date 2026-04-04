/*
  Warnings:

  - Made the column `name` on table `Group` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatarUrl` on table `Group` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatarUrl` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "avatarUrl" SET NOT NULL,
ALTER COLUMN "avatarUrl" SET DEFAULT 'https://cdn-icons-png.flaticon.com/512/17860/17860138.png';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatarUrl" SET NOT NULL,
ALTER COLUMN "avatarUrl" SET DEFAULT 'https://static.vecteezy.com/system/resources/thumbnails/067/451/117/small/avatar-simple-flat-default-user-profile-icon-gender-neutral-person-silhouette-profile-picture-symbol-user-account-dp-sign-best-for-social-media-icons-web-and-app-design-illustration-vector.jpg';
