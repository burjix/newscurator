import { createApiHandler } from "@/lib/api-handler";
import { createNewsSourceSchema, paginationSchema } from "@/lib/validations";
import { sanitizeResponse, verifyResourceAccess, verifySubscriptionAccess } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";
import { z } from "zod";

// GET /api/news-sources - List user's news sources
export const GET = createApiHandler(
  async ({ user }, { query }) => {
    const { page = 1, limit = 20, search, brandProfileId } = query || {};

    // If brandProfileId is provided, verify user owns that profile
    if (brandProfileId) {
      const profile = await prisma.brandProfile.findUnique({
        where: { id: brandProfileId },
        select: { userId: true }
      });
      
      if (!profile) {
        return Response.json(
          { error: "Brand profile not found" },
          { status: 404 }
        );
      }
      
      await verifyResourceAccess(profile.userId, user);
    }

    const where = {
      brandProfile: {
        userId: user.id
      },
      ...(brandProfileId && { brandProfileId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ]
      })
    };

    const [sources, total] = await Promise.all([
      prisma.newsSource.findMany({
        where,
        select: {
          id: true,
          name: true,
          url: true,
          type: true,
          isActive: true,
          weight: true,
          reliability: true,
          lastChecked: true,
          createdAt: true,
          updatedAt: true,
          brandProfile: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              articles: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.newsSource.count({ where })
    ]);

    return {
      sources: sanitizeResponse(sources),
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
      query: paginationSchema.extend({
        brandProfileId: z.string().cuid().optional()
      })
    }
  }
);

// POST /api/news-sources - Create new news source
export const POST = createApiHandler(
  async ({ user }, { body }) => {
    // Verify user owns the brand profile
    const profile = await prisma.brandProfile.findUnique({
      where: { id: body.brandProfileId },
      select: { userId: true }
    });

    if (!profile) {
      return Response.json(
        { error: "Brand profile not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(profile.userId, user);

    // Check subscription limits for news sources
    const existingCount = await prisma.newsSource.count({
      where: {
        brandProfile: {
          userId: user.id
        }
      }
    });

    const limits = {
      [SubscriptionTier.FREE]: 5,
      [SubscriptionTier.PROFESSIONAL]: 25,
      [SubscriptionTier.BUSINESS]: 100,
      [SubscriptionTier.ENTERPRISE]: -1, // unlimited
    };

    const userLimit = limits[user.subscriptionTier];
    if (userLimit !== -1 && existingCount >= userLimit) {
      verifySubscriptionAccess(SubscriptionTier.PROFESSIONAL, user.subscriptionTier);
    }

    // Validate the RSS feed URL
    const isValidRssUrl = await validateRssUrl(body.url);
    if (!isValidRssUrl) {
      return Response.json(
        { error: "Invalid RSS feed URL or feed is not accessible" },
        { status: 400 }
      );
    }

    const source = await prisma.newsSource.create({
      data: {
        ...body,
        reliability: 0.5, // Default reliability score
      },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        isActive: true,
        weight: true,
        reliability: true,
        createdAt: true,
        updatedAt: true,
        brandProfile: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Queue RSS feed processing (in background)
    await queueRssProcessing(source.id);

    return sanitizeResponse(source);
  },
  {
    requireAuth: true,
    validation: {
      body: createNewsSourceSchema
    },
    rateLimit: {
      limit: 10,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);

/**
 * Validate RSS feed URL
 */
async function validateRssUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 5000,
    });
    
    const contentType = response.headers.get('content-type') || '';
    return response.ok && (
      contentType.includes('xml') || 
      contentType.includes('rss') ||
      contentType.includes('atom')
    );
  } catch (error) {
    return false;
  }
}

/**
 * Queue RSS feed processing (placeholder - implement with actual queue)
 */
async function queueRssProcessing(sourceId: string): Promise<void> {
  // TODO: Implement with actual job queue (Bull, BullMQ, etc.)
  console.log(`Queued RSS processing for source: ${sourceId}`);
}