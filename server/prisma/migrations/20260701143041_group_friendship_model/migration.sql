/*
  Warnings:

  - You are about to drop the column `chatId` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `chatId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `chatId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropIndex
DROP INDEX "Friendship_chatId_key";

-- DropIndex
DROP INDEX "Group_chatId_key";

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "chatId";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "chatId";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "chatId",
ADD COLUMN     "friendshipFriendAId" INTEGER,
ADD COLUMN     "friendshipFriendBId" INTEGER,
ADD COLUMN     "groupId" INTEGER;

-- DropTable
DROP TABLE "Chat";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_friendshipFriendAId_friendshipFriendBId_fkey" FOREIGN KEY ("friendshipFriendAId", "friendshipFriendBId") REFERENCES "Friendship"("friendAId", "friendBId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
