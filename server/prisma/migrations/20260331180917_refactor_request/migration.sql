/*
  Warnings:

  - The primary key for the `Request` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fromId` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `toId` on the `Request` table. All the data in the column will be lost.
  - Added the required column `receiverdId` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_fromId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_toId_fkey";

-- AlterTable
ALTER TABLE "Request" DROP CONSTRAINT "Request_pkey",
DROP COLUMN "fromId",
DROP COLUMN "toId",
ADD COLUMN     "receiverdId" INTEGER NOT NULL,
ADD COLUMN     "senderId" INTEGER NOT NULL,
ADD CONSTRAINT "Request_pkey" PRIMARY KEY ("senderId", "receiverdId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_receiverdId_fkey" FOREIGN KEY ("receiverdId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
