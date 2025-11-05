-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "user_feedback" ALTER COLUMN "desired_features" DROP NOT NULL,
ALTER COLUMN "happiness_feedback" DROP NOT NULL;
