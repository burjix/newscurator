import { createApiHandler } from "@/lib/api-handler";
import { paginationSchema, saveArticleSchema } from "@/lib/validations";
import { sanitizeResponse, verifyResourceAccess } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/articles - Discover articles from user's news sources
export const GET = createApiHandler(
  async ({ user }, { query }) => {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      sourceId,
      brandProfileId,
      minRelevance = 0.3,
      sortBy = 'relevanceScore',
      sortOrder = 'desc'
    } = query || {};

    // Build where clause based on user's access
    const where = {
      source: {
        brandProfile: {
          userId: user.id
        }
      },
      ...(sourceId && { sourceId }),
      ...(brandProfileId && {
        source: {
          brandProfileId
        }
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ]
      }),
      relevanceScore: {
        gte: minRelevance
      }
    };

    const orderBy = {
      [sortBy]: sortOrder
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          summary: true,
          url: true,
          author: true,
          publishedAt: true,
          imageUrl: true,
          relevanceScore: true,
          sentimentScore: true,
          viralityScore: true,
          topics: true,
          entities: true,
          createdAt: true,
          source: {
            select: {
              id: true,
              name: true,
              type: true,
              brandProfile: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              posts: true,
              savedArticles: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy
      }),
      prisma.article.count({ where })
    ]);

    // Add user's saved status to each article
    const articleIds = articles.map(a => a.id);
    const savedArticles = await prisma.savedArticle.findMany({
      where: {
        userId: user.id,
        articleId: { in: articleIds }
      },
      select: { articleId: true }
    });

    const savedArticleIds = new Set(savedArticles.map(sa => sa.articleId));

    const articlesWithSavedStatus = articles.map(article => ({
      ...article,
      isSaved: savedArticleIds.has(article.id)
    }));

    return {
      articles: sanitizeResponse(articlesWithSavedStatus),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },
  {
    requireAuth: true,
    validation: {
      query: paginationSchema.extend({
        sourceId: z.string().cuid().optional(),
        brandProfileId: z.string().cuid().optional(),
        minRelevance: z.string().regex(/^0\.\d+$|^1\.0+$/).transform(Number).optional(),
        sortBy: z.enum(['relevanceScore', 'sentimentScore', 'viralityScore', 'publishedAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional()
      })
    }
  }
);

// POST /api/articles/save - Save article for later
export const POST = createApiHandler(
  async ({ user }, { body }) => {
    // Verify user has access to this article through their news sources
    const article = await prisma.article.findUnique({
      where: { id: body.articleId },
      select: {
        id: true,
        source: {
          select: {
            brandProfile: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!article) {
      return Response.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(article.source.brandProfile.userId, user);

    // Check if already saved
    const existingSave = await prisma.savedArticle.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: body.articleId
        }
      }
    });

    if (existingSave) {
      return Response.json(
        { error: "Article already saved" },
        { status: 400 }
      );
    }

    const savedArticle = await prisma.savedArticle.create({
      data: {
        userId: user.id,
        articleId: body.articleId,
        notes: body.notes,
        tags: body.tags || []
      },
      select: {
        id: true,
        notes: true,
        tags: true,
        savedAt: true,
        article: {
          select: {
            id: true,
            title: true,
            summary: true,
            url: true,
            author: true,
            publishedAt: true,
            imageUrl: true,
            relevanceScore: true,
            sentimentScore: true,
            viralityScore: true,
            topics: true
          }
        }
      }
    });

    return sanitizeResponse(savedArticle);
  },
  {
    requireAuth: true,
    validation: {
      body: saveArticleSchema
    },
    rateLimit: {
      limit: 50,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);