import { createApiHandler } from "@/lib/api-handler";
import { createBrandProfileSchema, paginationSchema } from "@/lib/validations";
import { sanitizeResponse, verifySubscriptionAccess } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

// GET /api/brand-profiles - List user's brand profiles
export const GET = createApiHandler(
  async ({ user }, { query }) => {
    const { page = 1, limit = 10, search } = query || {};

    const where = {
      userId: user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      })
    };

    const [profiles, total] = await Promise.all([
      prisma.brandProfile.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          industry: true,
          keywords: true,
          voiceTone: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              newsSources: true,
              posts: true,
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.brandProfile.count({ where })
    ]);

    return {
      profiles: sanitizeResponse(profiles),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },
  {
    requireAuth: true,
    validation: {
      query: paginationSchema
    }
  }
);

// POST /api/brand-profiles - Create new brand profile
export const POST = createApiHandler(
  async ({ user }, { body }) => {
    // Check subscription limits
    const existingCount = await prisma.brandProfile.count({
      where: { userId: user.id }
    });

    const limits = {
      [SubscriptionTier.FREE]: 1,
      [SubscriptionTier.PROFESSIONAL]: 3,
      [SubscriptionTier.BUSINESS]: 10,
      [SubscriptionTier.ENTERPRISE]: -1, // unlimited
    };

    const userLimit = limits[user.subscriptionTier];
    if (userLimit !== -1 && existingCount >= userLimit) {
      verifySubscriptionAccess(SubscriptionTier.PROFESSIONAL, user.subscriptionTier);
    }

    const profile = await prisma.brandProfile.create({
      data: {
        ...body,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        industry: true,
        niche: true,
        keywords: true,
        excludedKeywords: true,
        voiceTone: true,
        contentPreferences: true,
        audienceTargeting: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return sanitizeResponse(profile);
  },
  {
    requireAuth: true,
    validation: {
      body: createBrandProfileSchema
    },
    rateLimit: {
      limit: 10,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);