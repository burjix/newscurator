import { createApiHandler } from "@/lib/api-handler";
import { getLinkedInAuthUrl } from "@/lib/linkedin-client";
import { z } from "zod";

// GET /api/auth/linkedin - Get LinkedIn OAuth URL
export const GET = createApiHandler(
  async ({ user }, { query }) => {
    const callbackUrl = query?.callbackUrl || `${process.env.NEXTAUTH_URL}/api/auth/linkedin/callback`;
    const state = `user_${user.id}_${Date.now()}`;
    
    const authUrl = getLinkedInAuthUrl(callbackUrl, state);
    
    return {
      authUrl,
      state
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