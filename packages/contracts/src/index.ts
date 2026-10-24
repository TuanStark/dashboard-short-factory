import { z } from 'zod';

// ==========================================
// 1. CHANNELS
// ==========================================

export const PrivacyStatusSchema = z.enum(['private', 'unlisted', 'public']);
export type PrivacyStatus = z.infer<typeof PrivacyStatusSchema>;

export const ChannelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  genre_key: z.string().min(1),
  genre_name: z.string().optional(),
  description: z.string().optional(),
  default_privacy: PrivacyStatusSchema.default('unlisted'),
  default_tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  has_credentials: z.boolean().default(false),
  created_at: z.string().optional(),
});
export type Channel = z.infer<typeof ChannelSchema>;

export const ChannelCredentialsSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  refreshToken: z.string().min(1, 'Refresh Token is required'),
});
export type ChannelCredentials = z.infer<typeof ChannelCredentialsSchema>;

export const ConfigureChannelSchema = z.object({
  id: z.string().min(1, 'Channel ID is required'),
  name: z.string().min(1, 'Channel Name is required'),
  genreKey: z.string().min(1, 'Genre Key is required'),
  description: z.string().optional(),
  defaultPrivacy: PrivacyStatusSchema.default('unlisted'),
  defaultTags: z.array(z.string()).default([]),
  credentials: ChannelCredentialsSchema.optional(),
});
export type ConfigureChannelRequest = z.infer<typeof ConfigureChannelSchema>;

export const ChannelListResponseSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  data: z.array(ChannelSchema),
});
export type ChannelListResponse = z.infer<typeof ChannelListResponseSchema>;

// ==========================================
// 2. GENRES & BRAND DNA
// ==========================================

export const GenreProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  system_prompt_scriptwriter: z.string(),
  visual_style_prompt: z.string(),
  visual_negative_prompt: z.string(),
  tts_provider: z.string().default('msedge'),
  tts_voice_id: z.string(),
  soundscape_preset: z.string(),
  motion_engine_preset: z.string(),
  is_active: z.boolean().optional(),
});
export type GenreProfile = z.infer<typeof GenreProfileSchema>;

export const GenreListResponseSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  data: z.array(GenreProfileSchema),
});
export type GenreListResponse = z.infer<typeof GenreListResponseSchema>;

// ==========================================
// 3. PRODUCTION PIPELINE
// ==========================================

export const QcResultSchema = z.object({
  overallStatus: z.enum(['PASS', 'WARNING', 'FAIL']),
  technicalChecks: z
    .object({
      resolution: z.string().optional(),
      fps: z.number().optional(),
    })
    .optional(),
  styleAdherenceScore: z.number().min(0).max(1),
  rejectionReasons: z.array(z.string()).default([]),
});
export type QcResult = z.infer<typeof QcResultSchema>;

export const ProductionResultSchema = z.object({
  channelId: z.string(),
  channelName: z.string(),
  genreKey: z.string(),
  topicId: z.string(),
  title: z.string(),
  renderJobId: z.string(),
  durationSec: z.number(),
  fileSizeBytes: z.number(),
  cloudinaryUrl: z.string().url(),
  cloudinaryPublicId: z.string().optional(),
  youtubeVideoId: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  qcResult: QcResultSchema,
  purgedLocalDisk: z.boolean(),
});
export type ProductionResult = z.infer<typeof ProductionResultSchema>;

export const ProduceContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().optional(),
  targetDurationSec: z.number().min(10).max(120).optional(),
});

export const ProduceOptionsSchema = z.object({
  publishYouTube: z.boolean().optional(),
  uploadCloudinary: z.boolean().optional(),
  purgeLocalAfterUpload: z.boolean().optional(),
  privacyStatus: PrivacyStatusSchema.optional(),
});

export const ProduceRequestSchema = z.object({
  channelId: z.string().min(1, 'Channel ID is required'),
  content: ProduceContentSchema,
  options: ProduceOptionsSchema.optional(),
});
export type ProduceRequest = z.infer<typeof ProduceRequestSchema>;

export const ProduceResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: ProductionResultSchema,
});
export type ProduceResponse = z.infer<typeof ProduceResponseSchema>;

export const BatchItemSchema = z.object({
  channelId: z.string().min(1),
  content: z.object({
    title: z.string().min(1),
  }),
  options: z
    .object({
      publishYouTube: z.boolean().optional(),
    })
    .optional(),
});

export const BatchProduceRequestSchema = z.object({
  items: z.array(BatchItemSchema).min(1, 'At least 1 item is required for batch'),
});
export type BatchProduceRequest = z.infer<typeof BatchProduceRequestSchema>;

export const BatchResponseSchema = z.object({
  success: z.boolean(),
  total: z.number(),
  succeeded: z.number(),
  failed: z.number(),
  data: z.array(ProductionResultSchema),
  errors: z.array(z.string()).default([]),
});
export type BatchResponse = z.infer<typeof BatchResponseSchema>;

// ==========================================
// 4. TOPICS & HITL APPROVAL
// ==========================================

export const TopicStatusSchema = z.enum([
  'IDEA',
  'RESEARCH_READY',
  'PRODUCING',
  'READY_FOR_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'DISCARDED',
]);
export type TopicStatus = z.infer<typeof TopicStatusSchema>;

export const TopicSchema = z.object({
  id: z.string(),
  channel_id: z.string().optional(),
  channel_name: z.string().optional(),
  title: z.string(),
  category: z.string(),
  historical_period: z.string().optional(),
  potential_score: z.union([z.number(), z.string()]),
  status: z.string(),
  cloudinary_url: z.string().optional(),
  youtube_video_id: z.string().optional(),
  youtube_url: z.string().optional(),
  duration_sec: z.number().optional(),
  qc_score: z.number().optional(),
  style_adherence_score: z.number().optional(),
});
export type Topic = z.infer<typeof TopicSchema>;

export const TopicListResponseSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  data: z.array(TopicSchema),
});
export type TopicListResponse = z.infer<typeof TopicListResponseSchema>;

export const ApprovalActionSchema = z.enum(['APPROVE', 'REGENERATE', 'DISCARD']);
export type ApprovalAction = z.infer<typeof ApprovalActionSchema>;

export const ApprovalCallbackRequestSchema = z.object({
  shortId: z.string().min(1, 'Short/Topic ID is required'),
  action: ApprovalActionSchema,
  feedback: z.string().optional(),
});
export type ApprovalCallbackRequest = z.infer<typeof ApprovalCallbackRequestSchema>;

export const ApprovalCallbackResponseSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  videoId: z.string().optional(),
  youtubeUrl: z.string().optional(),
  message: z.string().optional(),
});
export type ApprovalCallbackResponse = z.infer<typeof ApprovalCallbackResponseSchema>;

// ==========================================
// 5. AUTO-SCHEDULER
// ==========================================

export const ScheduleSlotSchema = z.object({
  name: z.string(),
  timeEST: z.string(),
  timeVN: z.string(),
  target: z.string(),
});
export type ScheduleSlot = z.infer<typeof ScheduleSlotSchema>;

export const ScheduleConfigSchema = z.object({
  enabled: z.boolean(),
  cronExpression: z.string(),
  timezone: z.string(),
  nextRun: z.string().nullable().optional(),
  lastExecutedChannel: z.string().nullable().optional(),
  slots: z.array(ScheduleSlotSchema).optional(),
  isCurrentlyRunning: z.boolean().optional(),
  lastRunAt: z.string().nullable().optional(),
  lastRunResult: z.string().nullable().optional(),
  channelTurnIndex: z.number().optional(),
});
export type ScheduleConfig = z.infer<typeof ScheduleConfigSchema>;

export const ScheduleResponseSchema = z.object({
  success: z.boolean(),
  schedule: ScheduleConfigSchema,
});
export type ScheduleResponse = z.infer<typeof ScheduleResponseSchema>;

export const TriggerScheduleRequestSchema = z.object({
  channelId: z.string().optional(),
});
export type TriggerScheduleRequest = z.infer<typeof TriggerScheduleRequestSchema>;

// ==========================================
// 6. HEALTH & OBSERVABILITY
// ==========================================

export const HealthCheckResponseSchema = z.object({
  status: z.string(),
  service: z.string(),
  env: z.string(),
  database: z.string(),
  dbTime: z.string(),
  storage: z.object({
    rendersExist: z.boolean(),
  }),
});
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
