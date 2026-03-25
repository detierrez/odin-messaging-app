/*
  Warnings:

  - The primary key for the `Friendship` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId1` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `userId2` on the `Friendship` table. All the data in the column will be lost.
  - Added the required column `greaterId` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lesserId` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_userId1_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_userId2_fkey";

-- AlterTable
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_pkey",
DROP COLUMN "userId1",
DROP COLUMN "userId2",
ADD COLUMN     "greaterId" INTEGER NOT NULL,
ADD COLUMN     "lesserId" INTEGER NOT NULL,
ADD CONSTRAINT "Friendship_pkey" PRIMARY KEY ("lesserId", "greaterId");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_lesserId_fkey" FOREIGN KEY ("lesserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_greaterId_fkey" FOREIGN KEY ("greaterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
