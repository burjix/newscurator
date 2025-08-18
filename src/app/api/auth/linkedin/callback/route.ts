import { createApiHandler } from "@/lib/api-handler";
import { getLinkedInAccessToken, getLinkedInProfile } from "@/lib/linkedin-client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const linkedinCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional()
});

// GET /api/auth/linkedin/callback - Complete LinkedIn OAuth
export const GET = createApiHandler(
  async ({ user }, { query }) => {
    const { code, state } = query;
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/linkedin/callback`;
    
    // Exchange code for access token
    const tokenData = await getLinkedInAccessToken(code, callbackUrl);
    
    // Get user profile information
    const profile = await getLinkedInProfile({
      accessToken: tokenData.accessToken
    });
    
    // Check if this LinkedIn account is already connected
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        platform: 'linkedin',
        accountId: profile.id
      }
    });
    
    if (existingAccount && existingAccount.userId !== user.id) {
      throw new Error('This LinkedIn account is already connected to another user');
    }
    
    // Calculate token expiry
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + tokenData.expiresIn);
    
    // Create or update the social account
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'linkedin'
        }
      },
      create: {
        userId: user.id,
        platform: 'linkedin',
        accountId: profile.id,
        accountName: `${profile.firstName} ${profile.lastName}`,
        accessToken: tokenData.accessToken,
        tokenExpiry: tokenExpiry,
        isActive: true
      },
      update: {
        accountId: profile.id,
        accountName: `${profile.firstName} ${profile.lastName}`,
        accessToken: tokenData.accessToken,
        tokenExpiry: tokenExpiry,
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
        firstName: profile.firstName,
        lastName: profile.lastName,
        headline: profile.headline
      }
    };
  },
  {
    requireAuth: true,
    validation: {
      query: linkedinCallbackSchema
    }
  }
);