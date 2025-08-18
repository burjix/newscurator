import { createApiHandler } from "@/lib/api-handler";
import { createSocialAccountSchema, paginationSchema } from "@/lib/validations";
import { sanitizeResponse, verifySubscriptionAccess } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";
import { z } from "zod";

// GET /api/social-accounts - List user's social accounts
export const GET = createApiHandler(
  async ({ user }, { query }) => {
    const { page = 1, limit = 10, platform } = query || {};

    const where = {
      userId: user.id,
      ...(platform && { platform })
    };

    const [accounts, total] = await Promise.all([
      prisma.socialAccount.findMany({
        where,
        select: {
          id: true,
          platform: true,
          accountId: true,
          accountName: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Don't include sensitive tokens in list response
          _count: {
            select: {
              posts: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.socialAccount.count({ where })
    ]);

    return {
      accounts: sanitizeResponse(accounts),
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
        platform: z.enum(['twitter', 'linkedin']).optional()
      })
    }
  }
);

// POST /api/social-accounts - Connect new social account
export const POST = createApiHandler(
  async ({ user }, { body }) => {
    // Check subscription limits for social accounts
    const existingCount = await prisma.socialAccount.count({
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

    // Check if account already exists for this platform
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: user.id,
        platform: body.platform,
        accountId: body.accountId
      }
    });

    if (existingAccount) {
      return Response.json(
        { error: "This social account is already connected" },
        { status: 400 }
      );
    }

    // Validate the access token
    const isValidToken = await validateSocialToken(body.platform, body.accessToken);
    if (!isValidToken) {
      return Response.json(
        { error: "Invalid access token or social account verification failed" },
        { status: 400 }
      );
    }

    const account = await prisma.socialAccount.create({
      data: {
        userId: user.id,
        platform: body.platform,
        accountId: body.accountId,
        accountName: body.accountName,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        tokenExpiry: body.tokenExpiry ? new Date(body.tokenExpiry) : null,
      },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Don't return sensitive tokens
      }
    });

    return sanitizeResponse(account);
  },
  {
    requireAuth: true,
    validation: {
      body: createSocialAccountSchema
    },
    rateLimit: {
      limit: 5,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);

/**
 * Validate social media access token
 */
async function validateSocialToken(platform: string, accessToken: string): Promise<boolean> {
  try {
    if (platform === 'twitter') {
      // Validate Twitter token
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      return response.ok;
    }
    
    if (platform === 'linkedin') {
      // Validate LinkedIn token
      const response = await fetch('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      return response.ok;
    }
    
    return false;
  } catch (error) {
    console.error(`Error validating ${platform} token:`, error);
    return false;
  }
}