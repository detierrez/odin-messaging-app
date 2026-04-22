/*
  Warnings:

  - You are about to drop the column `greaterFriendshipId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `lesserFriendshipId` on the `Chat` table. All the data in the column will be lost.
  - The primary key for the `Friendship` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `greaterId` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `lesserId` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Membership` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[chatId]` on the table `Friendship` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatId` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAId` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userBId` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('DIRECT', 'GROUP');

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_lesserFriendshipId_greaterFriendshipId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_greaterId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_lesserId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropIndex
DROP INDEX "Chat_groupId_key";

-- DropIndex
DROP INDEX "Chat_lesserFriendshipId_greaterFriendshipId_key";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "greaterFriendshipId",
DROP COLUMN "groupId",
DROP COLUMN "lesserFriendshipId",
ADD COLUMN     "avatarUrl" TEXT DEFAULT 'https://cdn-icons-png.flaticon.com/512/17860/17860138.png',
ADD COLUMN     "name" TEXT,
ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'DIRECT';

-- AlterTable
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_pkey",
DROP COLUMN "greaterId",
DROP COLUMN "lesserId",
ADD COLUMN     "chatId" INTEGER NOT NULL,
ADD COLUMN     "userAId" INTEGER NOT NULL,
ADD COLUMN     "userBId" INTEGER NOT NULL,
ADD CONSTRAINT "Friendship_pkey" PRIMARY KEY ("userAId", "userBId");

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "text",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "Membership";

-- CreateTable
CREATE TABLE "WriteAccess" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "WriteAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadAccess" (
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "ReadAccess_pkey" PRIMARY KEY ("userId","chatId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_chatId_key" ON "Friendship"("chatId");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteAccess" ADD CONSTRAINT "WriteAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteAccess" ADD CONSTRAINT "WriteAccess_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadAccess" ADD CONSTRAINT "ReadAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadAccess" ADD CONSTRAINT "ReadAccess_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
