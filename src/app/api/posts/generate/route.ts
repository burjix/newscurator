import { createApiHandler } from "@/lib/api-handler";
import { z } from "zod";
import { sanitizeResponse, verifyResourceAccess } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { generateContent, generateContentVariations, scoreContent } from "@/lib/ai-content-generator";

const generatePostSchema = z.object({
  articleId: z.string().cuid(),
  brandProfileId: z.string().cuid(),
  platform: z.enum(['twitter', 'linkedin', 'facebook']),
  variations: z.number().min(1).max(5).optional().default(3),
  includeHashtags: z.boolean().optional().default(true),
  includeLink: z.boolean().optional().default(true),
  customInstructions: z.string().max(500).optional()
});

// POST /api/posts/generate - Generate AI content from article
export const POST = createApiHandler(
  async ({ user }, { body }) => {
    // Verify user owns the brand profile
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { id: body.brandProfileId }
    });

    if (!brandProfile) {
      return Response.json(
        { error: "Brand profile not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(brandProfile.userId, user);

    // Verify user has access to the article
    const article = await prisma.article.findUnique({
      where: { id: body.articleId },
      include: {
        source: {
          select: {
            name: true,
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

    // Generate content variations
    const variations = await generateContentVariations(
      {
        article,
        brandProfile,
        platform: body.platform,
        tone: typeof brandProfile.voiceTone === 'string' ? brandProfile.voiceTone : undefined,
        includeHashtags: body.includeHashtags,
        includeLink: body.includeLink,
        customInstructions: body.customInstructions
      },
      body.variations
    );

    // Score each variation
    const scoredVariations = variations.map(content => ({
      ...content,
      score: scoreContent(content.text, content.platform),
      characterCount: content.text.length,
      hashtagCount: content.hashtags.length
    }));

    // Sort by score
    scoredVariations.sort((a, b) => b.score - a.score);

    // Return generated content with metadata
    return sanitizeResponse({
      article: {
        id: article.id,
        title: article.title,
        summary: article.summary,
        url: article.url,
        imageUrl: article.imageUrl
      },
      brandProfile: {
        id: brandProfile.id,
        name: brandProfile.name,
        voiceTone: brandProfile.voiceTone
      },
      platform: body.platform,
      variations: scoredVariations,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'template-based', // Will be 'gpt-4' or 'claude-3' in production
        includesHashtags: body.includeHashtags,
        includesLink: body.includeLink
      }
    });
  },
  {
    requireAuth: true,
    validation: {
      body: generatePostSchema
    },
    rateLimit: {
      limit: 20,
      windowMs: 60 * 1000 // 20 generations per minute
    }
  }
);