-- CreateTable
CREATE TABLE "flyway_schema_history" (
    "installed_rank" INTEGER NOT NULL,
    "version" VARCHAR(50),
    "description" VARCHAR(200) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "script" VARCHAR(1000) NOT NULL,
    "checksum" INTEGER,
    "installed_by" VARCHAR(100) NOT NULL,
    "installed_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "execution_time" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,

    CONSTRAINT "flyway_schema_history_pk" PRIMARY KEY ("installed_rank")
);

-- CreateTable
CREATE TABLE "query_history" (
    "history_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "feedback" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "user_feedback" (
    "feedback_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "desired_features" TEXT NOT NULL,
    "happiness_feedback" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "auth_provider" VARCHAR(20) NOT NULL DEFAULT 'username',
    "google_id" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "flyway_schema_history_s_idx" ON "flyway_schema_history"("success");

-- CreateIndex
CREATE INDEX "index_user_chat_history" ON "query_history"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- AddForeignKey
ALTER TABLE "query_history" ADD CONSTRAINT "query_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
