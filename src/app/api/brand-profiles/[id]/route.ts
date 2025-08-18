import { createApiHandler } from "@/lib/api-handler";
import { updateBrandProfileSchema, brandProfileIdSchema } from "@/lib/validations";
import { sanitizeResponse, verifyResourceAccess, validateUpdateFields } from "@/lib/security";
import { prisma } from "@/lib/prisma";

// GET /api/brand-profiles/[id] - Get specific brand profile
export const GET = createApiHandler(
  async ({ user, params }) => {
    const profile = await prisma.brandProfile.findUnique({
      where: { id: params!.id },
      select: {
        id: true,
        userId: true,
        name: true,
        description: true,
        industry: true,
        niche: true,
        keywords: true,
        excludedKeywords: true,
        voiceTone: true,
        contentPreferences: true,
        audienceTargeting: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            newsSources: true,
            posts: true,
          }
        }
      }
    });

    if (!profile) {
      return Response.json(
        { error: "Brand profile not found" },
        { status: 404 }
      );
    }

    // Verify user owns this resource
    await verifyResourceAccess(profile.userId, user);

    return sanitizeResponse(profile);
  },
  {
    requireAuth: true,
    validation: {
      params: brandProfileIdSchema
    }
  }
);

// PATCH /api/brand-profiles/[id] - Update brand profile
export const PATCH = createApiHandler(
  async ({ user, params }, { body }) => {
    // First verify the profile exists and user owns it
    const existingProfile = await prisma.brandProfile.findUnique({
      where: { id: params!.id },
      select: { userId: true }
    });

    if (!existingProfile) {
      return Response.json(
        { error: "Brand profile not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(existingProfile.userId, user);

    // Validate only allowed fields can be updated
    const allowedFields = [
      'name', 'description', 'industry', 'niche', 'keywords', 
      'excludedKeywords', 'voiceTone', 'contentPreferences', 'audienceTargeting'
    ];
    validateUpdateFields(body, allowedFields, ['userId']);

    const updatedProfile = await prisma.brandProfile.update({
      where: { id: params!.id },
      data: body,
      select: {
        id: true,
        name: true,
        description: true,
        industry: true,
        niche: true,
        keywords: true,
        excludedKeywords: true,
        voiceTone: true,
        contentPreferences: true,
        audienceTargeting: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return sanitizeResponse(updatedProfile);
  },
  {
    requireAuth: true,
    validation: {
      params: brandProfileIdSchema,
      body: updateBrandProfileSchema
    },
    rateLimit: {
      limit: 20,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);

// DELETE /api/brand-profiles/[id] - Delete brand profile
export const DELETE = createApiHandler(
  async ({ user, params }) => {
    // First verify the profile exists and user owns it
    const existingProfile = await prisma.brandProfile.findUnique({
      where: { id: params!.id },
      select: { userId: true }
    });

    if (!existingProfile) {
      return Response.json(
        { error: "Brand profile not found" },
        { status: 404 }
      );
    }

    await verifyResourceAccess(existingProfile.userId, user);

    // Delete the profile (cascade will handle related records)
    await prisma.brandProfile.delete({
      where: { id: params!.id }
    });

    return { success: true };
  },
  {
    requireAuth: true,
    validation: {
      params: brandProfileIdSchema
    },
    rateLimit: {
      limit: 5,
      windowMs: 60 * 1000 // 1 minute
    }
  }
);