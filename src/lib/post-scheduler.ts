import { prisma } from '@/lib/prisma';
import { PostStatus } from '@prisma/client';

/**
 * Generate scheduled posts based on user preferences
 */
export async function generateScheduledPosts(): Promise<void> {
  try {
    // Get all active brand profiles with scheduling preferences
    const profiles = await prisma.brandProfile.findMany({
      where: {
        user: {
          subscriptionTier: {
            not: 'FREE' // Only for paid users
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            subscriptionTier: true,
            socialAccounts: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });

    for (const profile of profiles) {
      // Check if user has connected social accounts
      if (profile.user.socialAccounts.length === 0) {
        continue;
      }

      // Check for existing scheduled posts
      const scheduledCount = await prisma.post.count({
        where: {
          brandProfileId: profile.id,
          status: 'SCHEDULED',
          scheduledFor: {
            gte: new Date()
          }
        }
      });

      // Determine how many posts to generate based on subscription
      const postsToGenerate = getPostsToGenerate(
        profile.user.subscriptionTier,
        scheduledCount
      );

      if (postsToGenerate > 0) {
        // Get recent high-relevance articles
        const articles = await prisma.article.findMany({
          where: {
            source: {
              brandProfileId: profile.id
            },
            relevanceScore: {
              gte: 0.5
            },
            // Not already used in a post
            posts: {
              none: {}
            }
          },
          orderBy: [
            { relevanceScore: 'desc' },
            { publishedAt: 'desc' }
          ],
          take: postsToGenerate,
          include: {
            source: true
          }
        });

        // Generate posts for each article
        for (const article of articles) {
          await generatePostFromArticle(article, profile);
        }
      }
    }
  } catch (error) {
    console.error('Error generating scheduled posts:', error);
    throw error;
  }
}

/**
 * Determine how many posts to generate based on subscription
 */
function getPostsToGenerate(tier: string, existingScheduled: number): number {
  const limits = {
    FREE: 0,
    PROFESSIONAL: 5,
    BUSINESS: 10,
    ENTERPRISE: 20
  };

  const limit = limits[tier as keyof typeof limits] || 0;
  return Math.max(0, limit - existingScheduled);
}

/**
 * Generate a post from an article
 */
async function generatePostFromArticle(article: any, profile: any): Promise<void> {
  try {
    // Generate content based on voice tone and preferences
    const content = await generatePostContent(article, profile);

    // Calculate optimal posting time
    const scheduledFor = calculateOptimalPostTime(profile);

    // For now, we need to pick a social account to post to
    // In a full implementation, this would be configured per brand profile
    const socialAccounts = await prisma.socialAccount.findMany({
      where: {
        userId: profile.userId,
        isActive: true
      },
      take: 1
    });

    if (socialAccounts.length === 0) {
      console.log(`No active social accounts for user ${profile.userId}`);
      return;
    }

    // Create the post
    await prisma.post.create({
      data: {
        content: content.text,
        mediaUrls: article.imageUrl ? [article.imageUrl] : [],
        hashtags: [],
        mentions: [],
        status: PostStatus.SCHEDULED,
        scheduledFor,
        userId: profile.userId,
        brandProfileId: profile.id,
        socialAccountId: socialAccounts[0].id,
        articleId: article.id
      }
    });

    console.log(`Generated scheduled post for article: ${article.title}`);
  } catch (error) {
    console.error('Error generating post from article:', error);
  }
}

/**
 * Generate post content using AI or templates
 */
async function generatePostContent(article: any, profile: any): Promise<{ text: string }> {
  // For now, use a simple template-based approach
  // In production, this would integrate with OpenAI/Anthropic API
  
  const templates = {
    PROFESSIONAL: [
      `${article.title}\n\n${article.summary}\n\nRead more: ${article.url}`,
      `Industry insight: ${article.title}\n\n${getKeyPoints(article)}\n\nFull article: ${article.url}`
    ],
    CASUAL: [
      `Check this out! ${article.title} 👀\n\n${article.summary}\n\n${article.url}`,
      `Interesting read: ${article.title}\n\nKey takeaways:\n${getKeyPoints(article)}\n\n${article.url}`
    ],
    FORMAL: [
      `${article.title}\n\n${article.summary}\n\nSource: ${article.source.name}\nRead more: ${article.url}`,
      `Recent development: ${article.title}\n\n${getKeyPoints(article)}\n\nFull analysis: ${article.url}`
    ],
    HUMOROUS: [
      `Plot twist in ${profile.industry}! 🎭\n\n${article.title}\n\n${article.summary}\n\n${article.url}`,
      `Well, this is interesting... ${article.title}\n\nTL;DR:\n${getKeyPoints(article)}\n\n${article.url}`
    ]
  };

  const tone = profile.voiceTone || 'PROFESSIONAL';
  const toneTemplates = templates[tone as keyof typeof templates] || templates.PROFESSIONAL;
  const template = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];

  return { text: template };
}

/**
 * Extract key points from article
 */
function getKeyPoints(article: any): string {
  const summary = article.summary || article.content || '';
  const sentences = summary.split('. ').slice(0, 3);
  return sentences.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');
}

/**
 * Calculate optimal posting time based on engagement patterns
 */
function calculateOptimalPostTime(profile: any): Date {
  // For now, use simple scheduling logic
  // In production, this would analyze engagement patterns
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Schedule for tomorrow at a random optimal time (9 AM, 12 PM, 3 PM, 6 PM)
  const optimalHours = [9, 12, 15, 18];
  const hour = optimalHours[Math.floor(Math.random() * optimalHours.length)];
  
  tomorrow.setHours(hour, 0, 0, 0);
  
  return tomorrow;
}

/**
 * Publish scheduled posts that are due
 */
export async function publishScheduledPosts(): Promise<void> {
  try {
    const duePoots = await prisma.post.findMany({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledFor: {
          lte: new Date()
        }
      },
      include: {
        brandProfile: true,
        user: {
          include: {
            socialAccounts: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });

    for (const post of duePoots) {
      try {
        // Publish to each connected social account
        for (const account of post.user.socialAccounts) {
          await publishToSocialMedia(post, account);
        }

        // Update post status
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: PostStatus.PUBLISHED,
            publishedAt: new Date()
          }
        });

        console.log(`Published post: ${post.id}`);
      } catch (error) {
        console.error(`Error publishing post ${post.id}:`, error);
        
        // Mark as failed
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: PostStatus.FAILED
          }
        });
      }
    }
  } catch (error) {
    console.error('Error publishing scheduled posts:', error);
    throw error;
  }
}

/**
 * Publish post to social media platform
 */
async function publishToSocialMedia(post: any, account: any): Promise<void> {
  // This would integrate with actual social media APIs
  // For now, just log the action
  console.log(`Publishing to ${account.platform} (${account.username}): ${post.title}`);
  
  // In production:
  // - Twitter API integration
  // - LinkedIn API integration
  // - Facebook API integration
  // - Instagram API integration
}