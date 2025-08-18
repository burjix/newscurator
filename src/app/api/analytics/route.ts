import { createApiHandler } from "@/lib/api-handler";
import { analyticsQuerySchema } from "@/lib/validations";
import { sanitizeResponse } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/analytics - Get analytics data
export const GET = createApiHandler(
  async ({ user }, { query }) => {
    const { 
      timeRange = '30d',
      platform,
      metric,
      startDate,
      endDate 
    } = query || {};

    // Calculate date range
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const daysMap: Record<string, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90
      };
      const days = daysMap[timeRange as string] || 30;
      
      start = new Date(now);
      start.setDate(now.getDate() - days);
    }

    // Build platform filter
    const platformFilter = platform && platform !== 'all' ? {
      socialAccount: {
        platform
      }
    } : {};

    // Get overview stats
    const [
      totalPosts,
      publishedPosts,
      scheduledPosts,
      totalImpressions,
      totalEngagement,
      socialAccounts,
      topPosts
    ] = await Promise.all([
      // Total posts
      prisma.post.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: start,
            lte: end
          },
          ...platformFilter
        }
      }),

      // Published posts
      prisma.post.count({
        where: {
          userId: user.id,
          status: 'PUBLISHED',
          publishedAt: {
            gte: start,
            lte: end
          },
          ...platformFilter
        }
      }),

      // Scheduled posts
      prisma.post.count({
        where: {
          userId: user.id,
          status: 'SCHEDULED',
          ...platformFilter
        }
      }),

      // Total impressions (from engagement data)
      prisma.post.aggregate({
        where: {
          userId: user.id,
          status: 'PUBLISHED',
          publishedAt: {
            gte: start,
            lte: end
          },
          ...platformFilter,
          engagementData: {
            not: Prisma.JsonNull
          }
        },
        _sum: {
          // This would need to be a computed field or stored separately
          // For now, we'll use a placeholder
        }
      }),

      // Total engagement
      prisma.post.findMany({
        where: {
          userId: user.id,
          status: 'PUBLISHED',
          publishedAt: {
            gte: start,
            lte: end
          },
          ...platformFilter,
          engagementData: {
            not: Prisma.JsonNull
          }
        },
        select: {
          engagementData: true
        }
      }),

      // Social accounts count
      prisma.socialAccount.count({
        where: {
          userId: user.id,
          isActive: true,
          ...(platform && platform !== 'all' && { platform })
        }
      }),

      // Top performing posts
      prisma.post.findMany({
        where: {
          userId: user.id,
          status: 'PUBLISHED',
          publishedAt: {
            gte: start,
            lte: end
          },
          ...platformFilter,
          performanceScore: {
            not: null
          }
        },
        select: {
          id: true,
          content: true,
          publishedAt: true,
          engagementData: true,
          performanceScore: true,
          socialAccount: {
            select: {
              platform: true,
              accountName: true
            }
          }
        },
        orderBy: {
          performanceScore: 'desc'
        },
        take: 10
      })
    ]);

    // Calculate engagement metrics from engagementData
    let calculatedImpressions = 0;
    let calculatedEngagement = 0;

    totalEngagement.forEach(post => {
      if (post.engagementData && typeof post.engagementData === 'object') {
        const data = post.engagementData as any;
        calculatedImpressions += data.impressions || 0;
        calculatedEngagement += (data.likes || 0) + (data.shares || 0) + (data.comments || 0);
      }
    });

    // Calculate engagement rate
    const engagementRate = calculatedImpressions > 0 
      ? (calculatedEngagement / calculatedImpressions) * 100 
      : 0;

    // Get platform breakdown
    const platformBreakdown = await prisma.post.groupBy({
      by: ['socialAccountId'],
      where: {
        userId: user.id,
        status: 'PUBLISHED',
        publishedAt: {
          gte: start,
          lte: end
        }
      },
      _count: {
        id: true
      }
    });

    // Get platform details for breakdown
    const socialAccountIds = platformBreakdown.map(p => p.socialAccountId).filter(Boolean);
    const platformDetails = await prisma.socialAccount.findMany({
      where: {
        id: { in: socialAccountIds },
        userId: user.id
      },
      select: {
        id: true,
        platform: true,
        accountName: true
      }
    });

    const platformMap = new Map(platformDetails.map(p => [p.id, p]));
    const platformStats = platformBreakdown.map(stat => ({
      platform: platformMap.get(stat.socialAccountId!)?.platform,
      accountName: platformMap.get(stat.socialAccountId!)?.accountName,
      postCount: stat._count.id
    })).filter(stat => stat.platform);

    // Get trends (compare with previous period)
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousPublishedPosts = await prisma.post.count({
      where: {
        userId: user.id,
        status: 'PUBLISHED',
        publishedAt: {
          gte: previousStart,
          lt: start
        },
        ...platformFilter
      }
    });

    const publishedPostsTrend = previousPublishedPosts > 0 
      ? ((publishedPosts - previousPublishedPosts) / previousPublishedPosts) * 100 
      : publishedPosts > 0 ? 100 : 0;

    return sanitizeResponse({
      overview: {
        totalPosts,
        publishedPosts,
        scheduledPosts,
        totalImpressions: calculatedImpressions,
        totalEngagement: calculatedEngagement,
        engagementRate: Math.round(engagementRate * 100) / 100,
        socialAccounts,
        trends: {
          publishedPosts: Math.round(publishedPostsTrend * 100) / 100,
          // Add more trends as needed
        }
      },
      platformStats,
      topPosts: topPosts.map(post => ({
        ...post,
        content: post.content.length > 100 
          ? post.content.substring(0, 100) + '...' 
          : post.content
      })),
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  },
  {
    requireAuth: true,
    validation: {
      query: analyticsQuerySchema
    }
  }
);