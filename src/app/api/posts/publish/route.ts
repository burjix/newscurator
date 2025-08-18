import { createApiHandler } from "@/lib/api-handler";
import { z } from "zod";
import { sanitizeResponse, verifyResourceAccess } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

const publishPostSchema = z.object({
  postId: z.string().cuid(),
  publishNow: z.boolean().optional().default(false)
});

// POST /api/posts/publish - Publish a post to social media
export const POST = createApiHandler(
  async ({ user }, { body }) => {
    // Get the post and verify ownership
    const post = await prisma.post.findUnique({
      where: { id: body.postId },
      include: {
        socialAccount: true,
        brandProfile: true,
        article: true
      }
    });
    
    if (!post) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    if (post.userId !== user.id) {
      return Response.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    if (post.status === PostStatus.PUBLISHED) {
      return Response.json(
        { error: "Post already published" },
        { status: 400 }
      );
    }
    
    try {
      let platformPostId: string | null = null;
      let publishedUrl: string | null = null;
      
      // Publish to the specified platform
      if (post.socialAccount.platform === 'twitter') {
        const { postTweet } = await import('@/lib/twitter-client');
        
        const result = await postTweet(
          {
            accessToken: post.socialAccount.accessToken,
            accessTokenSecret: post.socialAccount.refreshToken || ''
          },
          {
            text: post.content,
            mediaUrls: post.mediaUrls || []
          }
        );
        
        platformPostId = result.id;
        publishedUrl = result.url;
        
      } else if (post.socialAccount.platform === 'linkedin') {
        const { postToLinkedIn } = await import('@/lib/linkedin-client');
        
        const result = await postToLinkedIn(
          {
            accessToken: post.socialAccount.accessToken
          },
          {
            text: post.content,
            mediaUrls: post.mediaUrls || []
          }
        );
        
        platformPostId = result.id;
        publishedUrl = result.url;
        
      } else {
        return Response.json(
          { error: `Publishing to ${post.socialAccount.platform} not yet supported` },
          { status: 400 }
        );
      }
      
      // Update post status and platform ID
      const updatedPost = await prisma.post.update({
        where: { id: post.id },
        data: {
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
          platformPostId
        },
        include: {
          socialAccount: {
            select: {
              id: true,
              platform: true,
              accountName: true
            }
          },
          brandProfile: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      return sanitizeResponse({
        success: true,
        post: {
          id: updatedPost.id,
          content: updatedPost.content,
          status: updatedPost.status,
          publishedAt: updatedPost.publishedAt,
          platformPostId: updatedPost.platformPostId,
          publishedUrl,
          socialAccount: updatedPost.socialAccount,
          brandProfile: updatedPost.brandProfile
        }
      });
      
    } catch (error) {
      console.error('Publishing error:', error);
      
      // Mark post as failed
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: PostStatus.FAILED
        }
      });
      
      return Response.json(
        { 
          error: "Failed to publish post",
          details: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    validation: {
      body: publishPostSchema
    },
    rateLimit: {
      limit: 10,
      windowMs: 60 * 1000 // 10 posts per minute
    }
  }
);