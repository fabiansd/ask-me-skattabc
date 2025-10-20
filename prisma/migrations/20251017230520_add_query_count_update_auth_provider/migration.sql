-- AlterTable
ALTER TABLE "users" ADD COLUMN     "query_count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "auth_provider" SET DEFAULT 'default';
