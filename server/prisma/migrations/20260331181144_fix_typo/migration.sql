/*
  Warnings:

  - The primary key for the `Request` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `receiverdId` on the `Request` table. All the data in the column will be lost.
  - Added the required column `receiverId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_receiverdId_fkey";

-- AlterTable
ALTER TABLE "Request" DROP CONSTRAINT "Request_pkey",
DROP COLUMN "receiverdId",
ADD COLUMN     "receiverId" INTEGER NOT NULL,
ADD CONSTRAINT "Request_pkey" PRIMARY KEY ("senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
