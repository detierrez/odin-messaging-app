/*
  Warnings:

  - You are about to drop the column `friendshipFriendAId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `friendshipFriendBId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_friendshipFriendAId_friendshipFriendBId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "friendshipFriendAId",
DROP COLUMN "friendshipFriendBId",
ADD COLUMN     "friendAId" INTEGER,
ADD COLUMN     "friendBId" INTEGER;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_friendAId_friendBId_fkey" FOREIGN KEY ("friendAId", "friendBId") REFERENCES "Friendship"("friendAId", "friendBId") ON DELETE CASCADE ON UPDATE CASCADE;
