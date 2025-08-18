import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, SubscriptionTier } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
}

export class SecurityError extends Error {
  constructor(
    message: string, 
    public statusCode: number = 403,
    public code: string = "FORBIDDEN"
  ) {
    super(message);
    this.name = "SecurityError";
  }
}

/**
 * Get authenticated user from session with proper error handling
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new SecurityError("Authentication required", 401, "UNAUTHORIZED");
  }

  // Fetch fresh user data to ensure role/permissions are current
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      subscriptionTier: true,
    }
  });

  if (!user) {
    throw new SecurityError("User not found", 401, "UNAUTHORIZED");
  }

  return user;
}

/**
 * Verify user can access a specific resource
 */
export async function verifyResourceAccess(
  resourceUserId: string, 
  currentUser: AuthenticatedUser
): Promise<void> {
  // Admin can access everything
  if (currentUser.role === UserRole.ADMIN) {
    return;
  }

  // Users can only access their own resources
  if (resourceUserId !== currentUser.id) {
    throw new SecurityError("Access denied to this resource", 403, "FORBIDDEN");
  }
}

/**
 * Verify admin access
 */
export function requireAdmin(user: AuthenticatedUser): void {
  if (user.role !== UserRole.ADMIN) {
    throw new SecurityError("Admin access required", 403, "ADMIN_REQUIRED");
  }
}

/**
 * Verify subscription tier access
 */
export function verifySubscriptionAccess(
  requiredTier: SubscriptionTier,
  userTier: SubscriptionTier
): void {
  const tierLevels = {
    [SubscriptionTier.FREE]: 0,
    [SubscriptionTier.PROFESSIONAL]: 1,
    [SubscriptionTier.BUSINESS]: 2,
    [SubscriptionTier.ENTERPRISE]: 3,
  };

  if (tierLevels[userTier] < tierLevels[requiredTier]) {
    throw new SecurityError(
      `${requiredTier} subscription required`, 
      402, 
      "SUBSCRIPTION_REQUIRED"
    );
  }
}

/**
 * Sanitize user data for client response (remove sensitive fields)
 */
export function sanitizeUser(user: any) {
  const { password, emailVerified, ...sanitized } = user;
  return sanitized;
}

/**
 * Sanitize array of objects by removing sensitive fields
 */
export function sanitizeResponse<T extends Record<string, any>>(
  data: T | T[],
  sensitiveFields: string[] = []
): T | T[] {
  const defaultSensitiveFields = [
    'password',
    'accessToken', 
    'refreshToken',
    'emailVerified',
    'tokenExpiry'
  ];
  
  const fieldsToRemove = [...defaultSensitiveFields, ...sensitiveFields];
  
  if (Array.isArray(data)) {
    return data.map(item => removeSensitiveFields(item, fieldsToRemove));
  }
  
  return removeSensitiveFields(data, fieldsToRemove);
}

function removeSensitiveFields(obj: any, fields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  fields.forEach(field => {
    delete sanitized[field];
  });
  
  return sanitized;
}

/**
 * Validate that user can only update allowed fields
 */
export function validateUpdateFields(
  updateData: Record<string, any>,
  allowedFields: string[],
  protectedFields: string[] = []
): void {
  const allProtectedFields = [
    'id',
    'role', 
    'subscriptionTier',
    'createdAt',
    'updatedAt',
    ...protectedFields
  ];

  // Check for protected fields
  const attemptedProtectedFields = Object.keys(updateData).filter(field => 
    allProtectedFields.includes(field)
  );
  
  if (attemptedProtectedFields.length > 0) {
    throw new SecurityError(
      `Cannot update protected fields: ${attemptedProtectedFields.join(', ')}`,
      400,
      "PROTECTED_FIELD"
    );
  }

  // Check for disallowed fields
  const disallowedFields = Object.keys(updateData).filter(field => 
    !allowedFields.includes(field)
  );
  
  if (disallowedFields.length > 0) {
    throw new SecurityError(
      `Invalid fields: ${disallowedFields.join(', ')}`,
      400,
      "INVALID_FIELD"
    );
  }
}

/**
 * Rate limiting storage (in production, use Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiter
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

/**
 * Get client IP for rate limiting
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
} as const;