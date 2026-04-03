/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the `Participation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[groupId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lesserFriendshipId,greaterFriendshipId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Participation" DROP CONSTRAINT "Participation_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Participation" DROP CONSTRAINT "Participation_userId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "avatarUrl",
DROP COLUMN "name",
DROP COLUMN "type",
ADD COLUMN     "greaterFriendshipId" INTEGER,
ADD COLUMN     "groupId" INTEGER,
ADD COLUMN     "lesserFriendshipId" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatarUrl" DROP NOT NULL,
ALTER COLUMN "avatarUrl" DROP DEFAULT;

-- DropTable
DROP TABLE "Participation";

-- DropEnum
DROP TYPE "ChatType";

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_groupId_key" ON "Chat"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_lesserFriendshipId_greaterFriendshipId_key" ON "Chat"("lesserFriendshipId", "greaterFriendshipId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_lesserFriendshipId_greaterFriendshipId_fkey" FOREIGN KEY ("lesserFriendshipId", "greaterFriendshipId") REFERENCES "Friendship"("lesserId", "greaterId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
