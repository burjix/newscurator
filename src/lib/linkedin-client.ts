interface LinkedInCredentials {
  accessToken: string;
}

interface LinkedInPostOptions {
  text: string;
  mediaUrls?: string[];
  articleUrl?: string;
}

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  headline?: string;
}

/**
 * Post content to LinkedIn
 */
export async function postToLinkedIn(
  credentials: LinkedInCredentials,
  options: LinkedInPostOptions
): Promise<{ id: string; url: string }> {
  try {
    // Get user profile first to get the person ID
    const profile = await getLinkedInProfile(credentials);
    const personId = `urn:li:person:${profile.id}`;
    
    // Prepare the post content
    let postText = options.text;
    if (options.articleUrl) {
      postText += `\n\n${options.articleUrl}`;
    }
    
    const postData = {
      author: personId,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: postText
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    // If there are media URLs, we need to handle media upload
    if (options.mediaUrls && options.mediaUrls.length > 0) {
      // For now, we'll include media URLs in the text
      // Full media upload would require additional LinkedIn API calls
      console.log('Media URLs provided but not yet implemented for LinkedIn');
    }
    
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn API error: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    const postId = result.id;
    
    return {
      id: postId,
      url: `https://www.linkedin.com/feed/update/${postId}`
    };
  } catch (error) {
    console.error('LinkedIn posting error:', error);
    throw new Error(`Failed to post to LinkedIn: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get LinkedIn profile information
 */
export async function getLinkedInProfile(credentials: LinkedInCredentials): Promise<LinkedInProfile> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline)', {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      firstName: data.firstName.localized.en_US,
      lastName: data.lastName.localized.en_US,
      profilePicture: data.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
      headline: data.headline?.localized?.en_US
    };
  } catch (error) {
    console.error('LinkedIn profile error:', error);
    throw new Error(`Failed to get LinkedIn profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get LinkedIn OAuth 2.0 authorization URL
 */
export function getLinkedInAuthUrl(callbackUrl: string, state?: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const scope = 'r_liteprofile r_emailaddress w_member_social';
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: scope,
    ...(state && { state })
  });
  
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getLinkedInAccessToken(
  authCode: string,
  callbackUrl: string
): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: callbackUrl,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn token exchange error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in
    };
  } catch (error) {
    console.error('LinkedIn token exchange error:', error);
    throw new Error(`Failed to get access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get post engagement metrics (requires additional permissions)
 */
export async function getLinkedInPostMetrics(
  credentials: LinkedInCredentials,
  postId: string
): Promise<{
  likes: number;
  comments: number;
  shares: number;
  impressions?: number;
}> {
  try {
    // Note: This requires additional permissions and may not be available for all apps
    const response = await fetch(`https://api.linkedin.com/v2/socialActions/${postId}/reactions`, {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn metrics error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // This is a simplified version - actual metrics would require parsing the complex response
    return {
      likes: 0,
      comments: 0,
      shares: 0,
      impressions: 0
    };
  } catch (error) {
    console.error('LinkedIn metrics error:', error);
    throw new Error(`Failed to get LinkedIn metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate LinkedIn credentials
 */
export async function validateLinkedInCredentials(credentials: LinkedInCredentials): Promise<boolean> {
  try {
    const profile = await getLinkedInProfile(credentials);
    return !!profile.id;
  } catch (error) {
    return false;
  }
}

/**
 * Refresh LinkedIn access token (if refresh token is available)
 */
export async function refreshLinkedInToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn token refresh error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in
    };
  } catch (error) {
    console.error('LinkedIn token refresh error:', error);
    throw new Error(`Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}