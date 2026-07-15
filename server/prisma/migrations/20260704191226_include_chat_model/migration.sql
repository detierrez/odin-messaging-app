/*
  Warnings:

  - You are about to drop the column `friendAId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `friendBId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `chatId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_friendAId_friendBId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_groupId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "friendAId",
DROP COLUMN "friendBId",
DROP COLUMN "groupId",
ADD COLUMN     "chatId" INTEGER NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "friendAId" INTEGER,
    "friendBId" INTEGER,
    "groupId" INTEGER,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_groupId_key" ON "Chat"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_friendAId_friendBId_key" ON "Chat"("friendAId", "friendBId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_friendAId_friendBId_fkey" FOREIGN KEY ("friendAId", "friendBId") REFERENCES "Friendship"("friendAId", "friendBId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
