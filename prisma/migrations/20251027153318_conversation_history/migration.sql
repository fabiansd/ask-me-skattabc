-- AlterTable
ALTER TABLE "query_history" ADD COLUMN     "conversation_id" INTEGER;

-- CreateTable
CREATE TABLE "conversations" (
    "conversation_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "message_id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE INDEX "index_conversations_user_id" ON "conversations"("user_id");

-- CreateIndex
CREATE INDEX "index_messages_conversation_id" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "index_query_history_conversation_id" ON "query_history"("conversation_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("conversation_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "query_history" ADD CONSTRAINT "query_history_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("conversation_id") ON DELETE SET NULL ON UPDATE NO ACTION;
