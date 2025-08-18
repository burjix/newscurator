import { createApiHandler } from "@/lib/api-handler";
import { updatePostSchema, postIdSchema } from "@/lib/validations";
import { sanitizeResponse, verifyResourceAccess, validateUpdateFields } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

// GET /api/posts/[id] - Get specific post
export const GET = createApiHandler(
  async ({ user, params }) => {
    const post = await prisma.post.findUnique({
      where: { id: params!.id },
      select: {
        id: true,
        userId: true,
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
            url: true,
            summary: true
          }
        }
      }
    });

    if (!post) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Verify user owns this resource
    await verifyResourceAccess(post.userId, user);

    return sanitizeResponse(post);
  },
  {
    requireAuth: true,
    validation: {
      params: postIdSchema
    }
  }
);

// PATCH /api/posts/[id] - Update post
export const PATCH = createApiHandler(
  async ({ user, params }, { body }) => {
    // First verify the post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: params!.id },
      select: { 
        userId: true, 
        status: true,
        socialAccount: {
          select: { platform: true }
        }
      }
    });

    if (!existingPost) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(existingPost.userId, user);

    // Don't allow editing published posts
    if (existingPost.status === PostStatus.PUBLISHED) {
      return Response.json(
        { error: "Cannot edit published posts" },
        { status: 400 }
      );
    }

    // Validate only allowed fields can be updated
    const allowedFields = [
      'content', 'mediaUrls', 'hashtags', 'mentions', 
      'scheduledFor', 'status'
    ];
    validateUpdateFields(body, allowedFields, [
      'userId', 'brandProfileId', 'socialAccountId', 'articleId', 
      'publishedAt', 'platformPostId', 'engagementData', 'performanceScore'
    ]);

    // Validate content length based on platform
    if (body.content) {
      const maxContentLength = existingPost.socialAccount.platform === 'twitter' ? 280 : 3000;
      if (body.content.length > maxContentLength) {
        return Response.json(
          { error: `Content too long for ${existingPost.socialAccount.platform}. Max ${maxContentLength} characters.` },
          { status: 400 }
        );
      }
    }

    // If updating scheduledFor, validate the date
    if (body.scheduledFor) {
      const scheduledDate = new Date(body.scheduledFor);
      if (scheduledDate <= new Date()) {
        body.status = PostStatus.SCHEDULED;
        // Queue for immediate publishing
        await queuePostForPublishing(params!.id);
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: params!.id },
      data: body,
      select: {
        id: true,
        content: true,
        mediaUrls: true,
        hashtags: true,
        mentions: true,
        status: true,
        scheduledFor: true,
        publishedAt: true,
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

    return sanitizeResponse(updatedPost);
  },
  {
    requireAuth: true,
    validation: {
      params: postIdSchema,
      body: updatePostSchema
    },
    rateLimit: {
      limit: 30,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);

// DELETE /api/posts/[id] - Delete post
export const DELETE = createApiHandler(
  async ({ user, params }) => {
    // First verify the post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: params!.id },
      select: { 
        userId: true, 
        status: true,
        platformPostId: true
      }
    });

    if (!existingPost) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(existingPost.userId, user);

    // Don't allow deleting published posts that are live on social media
    if (existingPost.status === PostStatus.PUBLISHED && existingPost.platformPostId) {
      return Response.json(
        { error: "Cannot delete published posts. Please delete from the social media platform directly." },
        { status: 400 }
      );
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: params!.id }
    });

    return { success: true };
  },
  {
    requireAuth: true,
    validation: {
      params: postIdSchema
    },
    rateLimit: {
      limit: 10,
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