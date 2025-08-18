import { z } from "zod";
import { UserRole, SubscriptionTier, PostStatus, SourceType } from "@prisma/client";

// User validations
export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  company: z.string().max(200).optional(),
  timezone: z.string().optional(),
}).strict();

export const userIdSchema = z.object({
  id: z.string().cuid(),
});

// Brand Profile validations
export const createBrandProfileSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  industry: z.array(z.string()).min(1),
  niche: z.array(z.string()).optional(),
  keywords: z.array(z.string()).min(3),
  excludedKeywords: z.array(z.string()).optional(),
  voiceTone: z.object({
    tone: z.enum(['professional', 'casual', 'authoritative', 'playful', 'inspirational', 'educational']),
    personality: z.string().optional(),
    guidelines: z.string().optional(),
  }),
  contentPreferences: z.object({
    postLength: z.enum(['short', 'medium', 'long']).optional(),
    contentTypes: z.array(z.string()).optional(),
    includeCTA: z.boolean().optional(),
  }).optional(),
  audienceTargeting: z.object({
    demographics: z.string().optional(),
    interests: z.array(z.string()).optional(),
    goals: z.string().optional(),
  }).optional(),
}).strict();

export const updateBrandProfileSchema = createBrandProfileSchema.partial();

export const brandProfileIdSchema = z.object({
  id: z.string().cuid(),
});

// News Source validations
export const createNewsSourceSchema = z.object({
  brandProfileId: z.string().cuid(),
  name: z.string().min(1).max(200),
  url: z.string().url(),
  type: z.nativeEnum(SourceType),
  weight: z.number().min(0).max(2).optional(),
}).strict();

export const updateNewsSourceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  url: z.string().url().optional(),
  type: z.nativeEnum(SourceType).optional(),
  isActive: z.boolean().optional(),
  weight: z.number().min(0).max(2).optional(),
}).strict();

export const newsSourceIdSchema = z.object({
  id: z.string().cuid(),
});

// Post validations
export const createPostSchema = z.object({
  content: z.string().min(1).max(3000),
  brandProfileId: z.string().cuid().optional(),
  socialAccountId: z.string().cuid(),
  articleId: z.string().cuid().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  scheduledFor: z.string().datetime().optional(),
}).strict();

export const updatePostSchema = z.object({
  content: z.string().min(1).max(3000).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  scheduledFor: z.string().datetime().optional(),
  status: z.nativeEnum(PostStatus).optional(),
}).strict();

export const postIdSchema = z.object({
  id: z.string().cuid(),
});

// Social Account validations
export const createSocialAccountSchema = z.object({
  platform: z.enum(['twitter', 'linkedin']),
  accountId: z.string(),
  accountName: z.string(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  tokenExpiry: z.string().datetime().optional(),
}).strict();

export const updateSocialAccountSchema = z.object({
  accountName: z.string().optional(),
  isActive: z.boolean().optional(),
}).strict();

export const socialAccountIdSchema = z.object({
  id: z.string().cuid(),
});

// Article validations
export const saveArticleSchema = z.object({
  articleId: z.string().cuid(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
}).strict();

export const articleIdSchema = z.object({
  id: z.string().cuid(),
});

// Query parameter validations
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timeRange: z.enum(['7d', '30d', '90d']).optional(),
});

export const analyticsQuerySchema = paginationSchema.merge(dateRangeSchema).merge(
  z.object({
    platform: z.enum(['twitter', 'linkedin', 'all']).optional(),
    metric: z.enum(['engagement', 'reach', 'clicks']).optional(),
  })
);

// Admin validations
export const adminUserUpdateSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  subscriptionTier: z.nativeEnum(SubscriptionTier).optional(),
  subscriptionEndDate: z.string().datetime().optional(),
}).strict();

// AI Generation validations
export const generatePostSchema = z.object({
  articleId: z.string().cuid().optional(),
  brandProfileId: z.string().cuid(),
  platform: z.enum(['twitter', 'linkedin', 'both']),
  tone: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  includeCTA: z.boolean().optional(),
  customPrompt: z.string().max(500).optional(),
}).strict();

// Webhook validations (for social media platforms)
export const webhookSchema = z.object({
  platform: z.enum(['twitter', 'linkedin']),
  eventType: z.string(),
  data: z.record(z.string(), z.any()),
  signature: z.string(),
}).strict();

// Export commonly used field validations
export const commonValidations = {
  cuid: () => z.string().cuid(),
  email: () => z.string().email(),
  url: () => z.string().url(),
  password: () => z.string().min(8).max(100),
  name: () => z.string().min(1).max(100),
  description: () => z.string().max(1000),
  content: () => z.string().min(1).max(3000),
};