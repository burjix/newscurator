import { createApiHandler } from "@/lib/api-handler";
import { updateSocialAccountSchema, socialAccountIdSchema } from "@/lib/validations";
import { sanitizeResponse, verifyResourceAccess, validateUpdateFields } from "@/lib/security";
import { prisma } from "@/lib/prisma";

// GET /api/social-accounts/[id] - Get specific social account
export const GET = createApiHandler(
  async ({ user, params }) => {
    const account = await prisma.socialAccount.findUnique({
      where: { id: params!.id },
      select: {
        id: true,
        userId: true,
        platform: true,
        accountId: true,
        accountName: true,
        isActive: true,
        tokenExpiry: true,
        createdAt: true,
        updatedAt: true,
        // Don't expose access tokens
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!account) {
      return Response.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    // Verify user owns this resource
    await verifyResourceAccess(account.userId, user);

    return sanitizeResponse(account);
  },
  {
    requireAuth: true,
    validation: {
      params: socialAccountIdSchema
    }
  }
);

// PATCH /api/social-accounts/[id] - Update social account
export const PATCH = createApiHandler(
  async ({ user, params }, { body }) => {
    // First verify the account exists and user owns it
    const existingAccount = await prisma.socialAccount.findUnique({
      where: { id: params!.id },
      select: { userId: true }
    });

    if (!existingAccount) {
      return Response.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(existingAccount.userId, user);

    // Validate only allowed fields can be updated
    const allowedFields = ['accountName', 'isActive'];
    validateUpdateFields(body, allowedFields, [
      'userId', 'platform', 'accountId', 'accessToken', 'refreshToken', 'tokenExpiry'
    ]);

    const updatedAccount = await prisma.socialAccount.update({
      where: { id: params!.id },
      data: body,
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return sanitizeResponse(updatedAccount);
  },
  {
    requireAuth: true,
    validation: {
      params: socialAccountIdSchema,
      body: updateSocialAccountSchema
    },
    rateLimit: {
      limit: 20,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);

// DELETE /api/social-accounts/[id] - Disconnect social account
export const DELETE = createApiHandler(
  async ({ user, params }) => {
    // First verify the account exists and user owns it
    const existingAccount = await prisma.socialAccount.findUnique({
      where: { id: params!.id },
      select: { 
        userId: true,
        platform: true,
        accessToken: true
      }
    });

    if (!existingAccount) {
      return Response.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(existingAccount.userId, user);

    // Revoke the access token on the platform (optional but good practice)
    try {
      await revokeSocialToken(existingAccount.platform, existingAccount.accessToken);
    } catch (error) {
      console.error('Error revoking social token:', error);
      // Continue with deletion even if revocation fails
    }

    // Check if there are any scheduled posts for this account
    const scheduledPosts = await prisma.post.count({
      where: {
        socialAccountId: params!.id,
        status: 'SCHEDULED'
      }
    });

    if (scheduledPosts > 0) {
      return Response.json(
        { 
          error: "Cannot disconnect account with scheduled posts. Please cancel or reschedule them first.",
          scheduledPosts 
        },
        { status: 400 }
      );
    }

    // Delete the account
    await prisma.socialAccount.delete({
      where: { id: params!.id }
    });

    return { success: true };
  },
  {
    requireAuth: true,
    validation: {
      params: socialAccountIdSchema
    },
    rateLimit: {
      limit: 5,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);

/**
 * Revoke social media access token
 */
async function revokeSocialToken(platform: string, accessToken: string): Promise<void> {
  try {
    if (platform === 'twitter') {
      // Revoke Twitter token
      await fetch('https://api.twitter.com/2/oauth2/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `token=${accessToken}&token_type_hint=access_token`,
      });
    }
    
    if (platform === 'linkedin') {
      // LinkedIn doesn't have a revoke endpoint, so we just invalidate locally
      console.log('LinkedIn token invalidated locally');
    }
  } catch (error) {
    console.error(`Error revoking ${platform} token:`, error);
    throw error;
  }
}