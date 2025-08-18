import { createApiHandler } from "@/lib/api-handler";
import { completeTwitterAuth, getTwitterProfile } from "@/lib/twitter-client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const twitterCallbackSchema = z.object({
  oauth_token: z.string(),
  oauth_verifier: z.string(),
  oauth_token_secret: z.string()
});

// GET /api/auth/twitter/callback - Complete Twitter OAuth
export const GET = createApiHandler(
  async ({ user }, { query }) => {
    const { oauth_token, oauth_verifier, oauth_token_secret } = query;
    
    // Complete the OAuth flow
    const authResult = await completeTwitterAuth(
      oauth_token,
      oauth_token_secret,
      oauth_verifier
    );
    
    // Get user profile information
    const profile = await getTwitterProfile({
      accessToken: authResult.accessToken,
      accessTokenSecret: authResult.accessTokenSecret
    });
    
    // Check if this Twitter account is already connected
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        platform: 'twitter',
        accountId: profile.id
      }
    });
    
    if (existingAccount && existingAccount.userId !== user.id) {
      throw new Error('This Twitter account is already connected to another user');
    }
    
    // Create or update the social account
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'twitter'
        }
      },
      create: {
        userId: user.id,
        platform: 'twitter',
        accountId: profile.id,
        accountName: profile.username,
        accessToken: authResult.accessToken,
        refreshToken: authResult.accessTokenSecret, // Store as refresh token for Twitter
        isActive: true
      },
      update: {
        accountId: profile.id,
        accountName: profile.username,
        accessToken: authResult.accessToken,
        refreshToken: authResult.accessTokenSecret,
        isActive: true
      }
    });
    
    return {
      success: true,
      account: {
        id: socialAccount.id,
        platform: socialAccount.platform,
        accountName: socialAccount.accountName,
        isActive: socialAccount.isActive
      },
      profile: {
        username: profile.username,
        name: profile.name,
        followers: profile.followers
      }
    };
  },
  {
    requireAuth: true,
    validation: {
      query: twitterCallbackSchema
    }
  }
);