import { TwitterApi } from 'twitter-api-v2';

// For user-specific tweets, we'll need OAuth1.0a tokens
// For now, we'll use app-only authentication for testing
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  // For posting, we need user tokens (OAuth 1.0a)
  // These would be stored per user in the database
});

interface TwitterPostOptions {
  text: string;
  mediaUrls?: string[];
  replyTo?: string;
}

interface TwitterCredentials {
  accessToken: string;
  accessTokenSecret: string;
}

/**
 * Create authenticated Twitter client for a specific user
 */
export function createUserTwitterClient(credentials: TwitterCredentials): TwitterApi {
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: credentials.accessToken,
    accessSecret: credentials.accessTokenSecret,
  });
}

/**
 * Post a tweet using user credentials
 */
export async function postTweet(
  credentials: TwitterCredentials,
  options: TwitterPostOptions
): Promise<{ id: string; url: string }> {
  try {
    const userClient = createUserTwitterClient(credentials);
    
    let mediaIds: string[] = [];
    
    // Upload media if provided
    if (options.mediaUrls && options.mediaUrls.length > 0) {
      for (const mediaUrl of options.mediaUrls) {
        try {
          // Download and upload media
          const response = await fetch(mediaUrl);
          const buffer = await response.arrayBuffer();
          const mediaId = await userClient.v1.uploadMedia(Buffer.from(buffer), {
            mimeType: response.headers.get('content-type') || 'image/jpeg'
          });
          mediaIds.push(mediaId);
        } catch (error) {
          console.error('Error uploading media:', error);
        }
      }
    }
    
    // Create tweet options
    const tweetOptions: any = {
      text: options.text
    };
    
    if (mediaIds.length > 0) {
      tweetOptions.media = { media_ids: mediaIds };
    }
    
    if (options.replyTo) {
      tweetOptions.reply = { in_reply_to_tweet_id: options.replyTo };
    }
    
    // Post the tweet
    const tweet = await userClient.v2.tweet(tweetOptions);
    
    return {
      id: tweet.data.id,
      url: `https://twitter.com/i/web/status/${tweet.data.id}`
    };
  } catch (error) {
    console.error('Twitter posting error:', error);
    throw new Error(`Failed to post tweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get Twitter OAuth 1.0a authentication URL
 */
export async function getTwitterAuthUrl(callbackUrl: string): Promise<{ url: string; oauthToken: string; oauthTokenSecret: string }> {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
    });
    
    const authLink = await client.generateAuthLink(callbackUrl, { linkMode: 'authorize' });
    
    return {
      url: authLink.url,
      oauthToken: authLink.oauth_token,
      oauthTokenSecret: authLink.oauth_token_secret,
    };
  } catch (error) {
    console.error('Twitter auth URL error:', error);
    throw new Error(`Failed to generate auth URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Complete Twitter OAuth flow and get user tokens
 */
export async function completeTwitterAuth(
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string
): Promise<{
  accessToken: string;
  accessTokenSecret: string;
  userId: string;
  screenName: string;
}> {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: oauthToken,
      accessSecret: oauthTokenSecret,
    });
    
    const loginResult = await client.login(oauthVerifier);
    
    return {
      accessToken: loginResult.accessToken,
      accessTokenSecret: loginResult.accessSecret,
      userId: loginResult.userId,
      screenName: loginResult.screenName,
    };
  } catch (error) {
    console.error('Twitter auth completion error:', error);
    throw new Error(`Failed to complete auth: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user's Twitter profile information
 */
export async function getTwitterProfile(credentials: TwitterCredentials): Promise<{
  id: string;
  username: string;
  name: string;
  profileImage: string;
  followers: number;
}> {
  try {
    const userClient = createUserTwitterClient(credentials);
    const user = await userClient.v2.me({
      'user.fields': ['public_metrics', 'profile_image_url']
    });
    
    return {
      id: user.data.id,
      username: user.data.username,
      name: user.data.name,
      profileImage: user.data.profile_image_url || '',
      followers: user.data.public_metrics?.followers_count || 0,
    };
  } catch (error) {
    console.error('Twitter profile error:', error);
    throw new Error(`Failed to get profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get tweet engagement metrics
 */
export async function getTweetMetrics(
  credentials: TwitterCredentials,
  tweetId: string
): Promise<{
  likes: number;
  retweets: number;
  replies: number;
  impressions?: number;
}> {
  try {
    const userClient = createUserTwitterClient(credentials);
    const tweet = await userClient.v2.singleTweet(tweetId, {
      'tweet.fields': ['public_metrics']
    });
    
    const metrics = tweet.data.public_metrics;
    
    return {
      likes: metrics?.like_count || 0,
      retweets: metrics?.retweet_count || 0,
      replies: metrics?.reply_count || 0,
      impressions: metrics?.impression_count,
    };
  } catch (error) {
    console.error('Twitter metrics error:', error);
    throw new Error(`Failed to get metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a tweet
 */
export async function deleteTweet(
  credentials: TwitterCredentials,
  tweetId: string
): Promise<boolean> {
  try {
    const userClient = createUserTwitterClient(credentials);
    const result = await userClient.v2.deleteTweet(tweetId);
    return result.data.deleted;
  } catch (error) {
    console.error('Twitter delete error:', error);
    throw new Error(`Failed to delete tweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if Twitter credentials are valid
 */
export async function validateTwitterCredentials(credentials: TwitterCredentials): Promise<boolean> {
  try {
    const profile = await getTwitterProfile(credentials);
    return !!profile.id;
  } catch (error) {
    return false;
  }
}