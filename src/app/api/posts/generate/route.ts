import { createApiHandler } from "@/lib/api-handler";
import { z } from "zod";
import { sanitizeResponse, verifyResourceAccess } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { generateContent, generateContentVariations, scoreContent } from "@/lib/ai-content-generator";
import { generateAIContent, generateAIContentVariations, analyzeContentEngagement } from "@/lib/openai-content-generator";

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

    // Try to use OpenAI first, fallback to templates
    let variations;
    try {
      if (process.env.OPENAI_API_KEY) {
        variations = await generateAIContentVariations(
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
      } else {
        throw new Error('OpenAI API key not available');
      }
    } catch (error) {
      console.log('Using template fallback for content generation');
      variations = await generateContentVariations(
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
    }

    // Score each variation using AI if available, fallback to template scoring
    const scoredVariations = await Promise.all(
      variations.map(async (content) => {
        let score;
        try {
          if (process.env.OPENAI_API_KEY) {
            score = await analyzeContentEngagement(content.text, content.platform);
          } else {
            score = scoreContent(content.text, content.platform);
          }
        } catch (error) {
          score = scoreContent(content.text, content.platform);
        }
        
        return {
          ...content,
          score,
          characterCount: content.text.length,
          hashtagCount: content.hashtags.length
        };
      })
    );

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
        model: process.env.OPENAI_API_KEY ? 'gpt-4o-mini' : 'template-based',
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