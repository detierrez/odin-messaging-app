/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the `ReadAccess` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WriteAccess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReadAccess" DROP CONSTRAINT "ReadAccess_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ReadAccess" DROP CONSTRAINT "ReadAccess_userId_fkey";

-- DropForeignKey
ALTER TABLE "WriteAccess" DROP CONSTRAINT "WriteAccess_chatId_fkey";

-- DropForeignKey
ALTER TABLE "WriteAccess" DROP CONSTRAINT "WriteAccess_userId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "avatarUrl",
DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "type";

-- DropTable
DROP TABLE "ReadAccess";

-- DropTable
DROP TABLE "WriteAccess";

-- DropEnum
DROP TYPE "Type";

-- CreateTable
CREATE TABLE "Friendship" (
    "friendAId" INTEGER NOT NULL,
    "friendBId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("friendAId","friendBId")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "description" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_chatId_key" ON "Friendship"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_chatId_key" ON "Group"("chatId");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendAId_fkey" FOREIGN KEY ("friendAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendBId_fkey" FOREIGN KEY ("friendBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
