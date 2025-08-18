import { createApiHandler } from "@/lib/api-handler";
import { updateNewsSourceSchema, newsSourceIdSchema } from "@/lib/validations";
import { sanitizeResponse, verifyResourceAccess, validateUpdateFields } from "@/lib/security";
import { prisma } from "@/lib/prisma";

// GET /api/news-sources/[id] - Get specific news source
export const GET = createApiHandler(
  async ({ user, params }) => {
    const source = await prisma.newsSource.findUnique({
      where: { id: params!.id },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        isActive: true,
        weight: true,
        reliability: true,
        lastChecked: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        brandProfile: {
          select: {
            id: true,
            name: true,
            userId: true
          }
        },
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!source) {
      return Response.json(
        { error: "News source not found" },
        { status: 404 }
      );
    }

    // Verify user owns this resource
    await verifyResourceAccess(source.brandProfile.userId, user);

    return sanitizeResponse(source);
  },
  {
    requireAuth: true,
    validation: {
      params: newsSourceIdSchema
    }
  }
);

// PATCH /api/news-sources/[id] - Update news source
export const PATCH = createApiHandler(
  async ({ user, params }, { body }) => {
    // First verify the source exists and user owns it
    const existingSource = await prisma.newsSource.findUnique({
      where: { id: params!.id },
      select: {
        brandProfile: {
          select: { userId: true }
        }
      }
    });

    if (!existingSource) {
      return Response.json(
        { error: "News source not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(existingSource.brandProfile.userId, user);

    // Validate only allowed fields can be updated
    const allowedFields = ['name', 'url', 'type', 'isActive', 'weight'];
    validateUpdateFields(body, allowedFields, ['brandProfileId', 'reliability', 'lastChecked']);

    // If URL is being updated, validate it
    if (body.url) {
      const isValidRssUrl = await validateRssUrl(body.url);
      if (!isValidRssUrl) {
        return Response.json(
          { error: "Invalid RSS feed URL or feed is not accessible" },
          { status: 400 }
        );
      }
    }

    const updatedSource = await prisma.newsSource.update({
      where: { id: params!.id },
      data: body,
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        isActive: true,
        weight: true,
        reliability: true,
        lastChecked: true,
        createdAt: true,
        updatedAt: true,
        brandProfile: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return sanitizeResponse(updatedSource);
  },
  {
    requireAuth: true,
    validation: {
      params: newsSourceIdSchema,
      body: updateNewsSourceSchema
    },
    rateLimit: {
      limit: 20,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);

// DELETE /api/news-sources/[id] - Delete news source
export const DELETE = createApiHandler(
  async ({ user, params }) => {
    // First verify the source exists and user owns it
    const existingSource = await prisma.newsSource.findUnique({
      where: { id: params!.id },
      select: {
        brandProfile: {
          select: { userId: true }
        }
      }
    });

    if (!existingSource) {
      return Response.json(
        { error: "News source not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(existingSource.brandProfile.userId, user);

    // Delete the source (cascade will handle related articles)
    await prisma.newsSource.delete({
      where: { id: params!.id }
    });

    return { success: true };
  },
  {
    requireAuth: true,
    validation: {
      params: newsSourceIdSchema
    },
    rateLimit: {
      limit: 5,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);

/**
 * Validate RSS feed URL
 */
async function validateRssUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    
    const contentType = response.headers.get('content-type') || '';
    return response.ok && (
      contentType.includes('xml') || 
      contentType.includes('rss') ||
      contentType.includes('atom')
    );
  } catch (error) {
    return false;
  }
}