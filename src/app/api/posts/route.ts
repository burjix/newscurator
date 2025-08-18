import { createApiHandler } from "@/lib/api-handler";
import { createPostSchema, paginationSchema } from "@/lib/validations";
import { sanitizeResponse, verifyResourceAccess } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { z } from "zod";

// GET /api/posts - List user's posts
export const GET = createApiHandler(
  async ({ user }, { query }) => {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status, 
      platform,
      brandProfileId 
    } = query || {};

    const where = {
      userId: user.id,
      ...(status && { status }),
      ...(brandProfileId && { brandProfileId }),
      ...(platform && {
        socialAccount: {
          platform
        }
      }),
      ...(search && {
        content: { contains: search, mode: 'insensitive' }
      })
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true,
          content: true,
          mediaUrls: true,
          hashtags: true,
          mentions: true,
          status: true,
          scheduledFor: true,
          publishedAt: true,
          platformPostId: true,
          engagementData: true,
          performanceScore: true,
          createdAt: true,
          updatedAt: true,
          brandProfile: {
            select: {
              id: true,
              name: true
            }
          },
          socialAccount: {
            select: {
              id: true,
              platform: true,
              accountName: true
            }
          },
          article: {
            select: {
              id: true,
              title: true,
              url: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count({ where })
    ]);

    return {
      posts: sanitizeResponse(posts),
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
        status: z.nativeEnum(PostStatus).optional(),
        platform: z.enum(['twitter', 'linkedin']).optional(),
        brandProfileId: z.string().cuid().optional()
      })
    }
  }
);

// POST /api/posts - Create new post
export const POST = createApiHandler(
  async ({ user }, { body }) => {
    // Verify user owns the social account
    const socialAccount = await prisma.socialAccount.findUnique({
      where: { 
        id: body.socialAccountId,
        userId: user.id 
      },
      select: { 
        id: true, 
        platform: true, 
        isActive: true,
        userId: true
      }
    });

    if (!socialAccount) {
      return Response.json(
        { error: "Social account not found or access denied" },
        { status: 404 }
      );
    }

    if (!socialAccount.isActive) {
      return Response.json(
        { error: "Social account is not active" },
        { status: 400 }
      );
    }

    // Verify user owns the brand profile if provided
    if (body.brandProfileId) {
      const profile = await prisma.brandProfile.findUnique({
        where: { id: body.brandProfileId },
        select: { userId: true }
      });

      if (!profile || profile.userId !== user.id) {
        return Response.json(
          { error: "Brand profile not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Verify user owns the article if provided
    if (body.articleId) {
      const article = await prisma.article.findUnique({
        where: { id: body.articleId },
        select: {
          source: {
            select: {
              brandProfile: {
                select: { userId: true }
              }
            }
          }
        }
      });

      if (!article || article.source.brandProfile.userId !== user.id) {
        return Response.json(
          { error: "Article not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Validate content length based on platform
    const maxContentLength = socialAccount.platform === 'twitter' ? 280 : 3000;
    if (body.content.length > maxContentLength) {
      return Response.json(
        { error: `Content too long for ${socialAccount.platform}. Max ${maxContentLength} characters.` },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        ...body,
        userId: user.id,
        status: body.scheduledFor ? PostStatus.SCHEDULED : PostStatus.DRAFT,
      },
      select: {
        id: true,
        content: true,
        mediaUrls: true,
        hashtags: true,
        mentions: true,
        status: true,
        scheduledFor: true,
        createdAt: true,
        updatedAt: true,
        brandProfile: {
          select: {
            id: true,
            name: true
          }
        },
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true
          }
        },
        article: {
          select: {
            id: true,
            title: true,
            url: true
          }
        }
      }
    });

    // If scheduled for immediate posting, queue for publishing
    if (post.scheduledFor && new Date(post.scheduledFor) <= new Date()) {
      await queuePostForPublishing(post.id);
    }

    return sanitizeResponse(post);
  },
  {
    requireAuth: true,
    validation: {
      body: createPostSchema
    },
    rateLimit: {
      limit: 50,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);

/**
 * Queue post for publishing (placeholder - implement with actual queue)
 */
async function queuePostForPublishing(postId: string): Promise<void> {
  // TODO: Implement with actual job queue (Bull, BullMQ, etc.)
  console.log(`Queued post for publishing: ${postId}`);
}