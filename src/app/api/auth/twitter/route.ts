import { createApiHandler } from "@/lib/api-handler";
import { getTwitterAuthUrl } from "@/lib/twitter-client";
import { z } from "zod";

const twitterAuthSchema = z.object({
  callbackUrl: z.string().url()
});

// GET /api/auth/twitter - Get Twitter OAuth URL
export const GET = createApiHandler(
  async ({ user }, { query }) => {
    const callbackUrl = query?.callbackUrl || `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`;
    
    const authData = await getTwitterAuthUrl(callbackUrl);
    
    // Store the oauth tokens temporarily (in a real app, use Redis or database)
    // For now, we'll return them to the client
    return {
      authUrl: authData.url,
      oauthToken: authData.oauthToken,
      oauthTokenSecret: authData.oauthTokenSecret
    };
  },
  {
    requireAuth: true,
    validation: {
      query: z.object({
        callbackUrl: z.string().url().optional()
      })
    }
  }
);