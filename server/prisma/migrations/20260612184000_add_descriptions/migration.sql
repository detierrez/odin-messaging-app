-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alias" TEXT,
ALTER COLUMN "avatarUrl" DROP NOT NULL,
ALTER COLUMN "avatarUrl" DROP DEFAULT;
