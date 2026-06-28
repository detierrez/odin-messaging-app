-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('USER_MESSAGE', 'OPEN', 'CLOSE', 'JOIN', 'LEAVE', 'ROLE_CHANGE', 'PROFILE_CHANGE');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'USER_MESSAGE';

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
