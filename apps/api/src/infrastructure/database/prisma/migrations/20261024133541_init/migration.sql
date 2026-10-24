-- CreateEnum
CREATE TYPE "PrivacyStatus" AS ENUM ('private', 'unlisted', 'public');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('IDEA', 'RESEARCH_READY', 'PRODUCING', 'READY_FOR_REVIEW', 'PUBLISHED', 'REJECTED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "QcStatus" AS ENUM ('PASS', 'WARNING', 'FAIL');

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genre_key" TEXT NOT NULL,
    "description" TEXT,
    "default_privacy" "PrivacyStatus" NOT NULL DEFAULT 'unlisted',
    "default_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_credentials" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret_encrypted" TEXT NOT NULL,
    "refresh_token_encrypted" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genre_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "system_prompt_scriptwriter" TEXT NOT NULL,
    "visual_style_prompt" TEXT NOT NULL,
    "visual_negative_prompt" TEXT NOT NULL,
    "tts_provider" TEXT NOT NULL DEFAULT 'msedge',
    "tts_voice_id" TEXT NOT NULL,
    "soundscape_preset" TEXT NOT NULL,
    "motion_engine_preset" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genre_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_videos" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "historical_period" TEXT,
    "potential_score" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "status" "TopicStatus" NOT NULL DEFAULT 'IDEA',
    "feedback" TEXT,
    "cloudinary_url" TEXT,
    "cloudinary_public_id" TEXT,
    "youtube_video_id" TEXT,
    "youtube_url" TEXT,
    "duration_sec" DOUBLE PRECISION,
    "file_size_bytes" BIGINT,
    "qc_status" "QcStatus",
    "style_adherence_score" DOUBLE PRECISION,
    "qc_details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_runs" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "render_job_id" TEXT NOT NULL,
    "duration_sec" DOUBLE PRECISION NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "purged_local_disk" BOOLEAN NOT NULL DEFAULT true,
    "overall_status" "QcStatus" NOT NULL,
    "rawLog" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_configs" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cron_expression" TEXT NOT NULL DEFAULT '0 10,18 * * *',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "next_run" TIMESTAMP(3),
    "last_executed_channel_id" TEXT,
    "slots_json" JSONB,
    "is_currently_running" BOOLEAN NOT NULL DEFAULT false,
    "last_run_at" TIMESTAMP(3),
    "last_run_result" TEXT,
    "channel_turn_index" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_credentials_channel_id_key" ON "google_credentials"("channel_id");

-- CreateIndex
CREATE INDEX "topic_videos_channel_id_idx" ON "topic_videos"("channel_id");

-- CreateIndex
CREATE INDEX "topic_videos_status_idx" ON "topic_videos"("status");

-- CreateIndex
CREATE INDEX "production_runs_topic_id_idx" ON "production_runs"("topic_id");

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_genre_key_fkey" FOREIGN KEY ("genre_key") REFERENCES "genre_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_credentials" ADD CONSTRAINT "google_credentials_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_videos" ADD CONSTRAINT "topic_videos_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_runs" ADD CONSTRAINT "production_runs_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_configs" ADD CONSTRAINT "schedule_configs_last_executed_channel_id_fkey" FOREIGN KEY ("last_executed_channel_id") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
