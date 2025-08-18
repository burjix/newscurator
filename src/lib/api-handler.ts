import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { 
  getAuthenticatedUser, 
  SecurityError, 
  checkRateLimit, 
  getClientIP,
  SECURITY_HEADERS,
  AuthenticatedUser
} from "@/lib/security";

export interface ApiContext {
  user: AuthenticatedUser;
  request: NextRequest;
  params?: Record<string, string>;
}

export interface ApiHandlerOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: {
    limit: number;
    windowMs: number;
  };
  validation?: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
  };
}

export type ApiHandler = (
  context: ApiContext,
  validatedData?: any
) => Promise<any>;

/**
 * Secure API route handler with built-in security measures
 */
export function createApiHandler(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
) {
  return async function(
    request: NextRequest,
    { params }: { params?: Record<string, string> } = {}
  ): Promise<NextResponse> {
    try {
      // Rate limiting
      if (options.rateLimit) {
        const clientIP = getClientIP(request);
        const { limit, windowMs } = options.rateLimit;
        
        if (!checkRateLimit(clientIP, limit, windowMs)) {
          return NextResponse.json(
            { error: "Rate limit exceeded" },
            { 
              status: 429,
              headers: SECURITY_HEADERS
            }
          );
        }
      }

      // Authentication
      let user: AuthenticatedUser | null = null;
      if (options.requireAuth !== false) {
        try {
          user = await getAuthenticatedUser();
        } catch (error) {
          if (options.requireAuth === true) {
            throw error;
          }
        }
      }

      // Admin check
      if (options.requireAdmin && user?.role !== 'ADMIN') {
        throw new SecurityError("Admin access required", 403, "ADMIN_REQUIRED");
      }

      // Validation
      let validatedData: any = {};
      if (options.validation) {
        try {
          // Validate request body
          if (options.validation.body && request.method !== 'GET') {
            const body = await request.json().catch(() => ({}));
            validatedData.body = options.validation.body.parse(body);
          }

          // Validate query parameters
          if (options.validation.query) {
            const url = new URL(request.url);
            const query = Object.fromEntries(url.searchParams.entries());
            validatedData.query = options.validation.query.parse(query);
          }

          // Validate route parameters
          if (options.validation.params && params) {
            validatedData.params = options.validation.params.parse(params);
          }
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              { 
                error: "Validation failed",
                details: error.errors
              },
              { 
                status: 400,
                headers: SECURITY_HEADERS
              }
            );
          }
          throw error;
        }
      }

      // Execute handler
      const context: ApiContext = {
        user: user!,
        request,
        params
      };

      const result = await handler(context, validatedData);

      // Return success response
      return NextResponse.json(result, {
        headers: SECURITY_HEADERS
      });

    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof SecurityError) {
        return NextResponse.json(
          { 
            error: error.message,
            code: error.code
          },
          { 
            status: error.statusCode,
            headers: SECURITY_HEADERS
          }
        );
      }

      if (error instanceof ZodError) {
        return NextResponse.json(
          { 
            error: "Validation failed",
            details: error.errors
          },
          { 
            status: 400,
            headers: SECURITY_HEADERS
          }
        );
      }

      // Don't leak internal error details
      return NextResponse.json(
        { error: "Internal server error" },
        { 
          status: 500,
          headers: SECURITY_HEADERS
        }
      );
    }
  };
}

/**
 * Helper for creating CRUD operations with proper security
 */
export function createCrudHandler<T>(
  entityName: string,
  options: {
    findMany: (userId: string, filters?: any) => Promise<T[]>;
    findUnique: (id: string, userId: string) => Promise<T | null>;
    create: (data: any, userId: string) => Promise<T>;
    update: (id: string, data: any, userId: string) => Promise<T>;
    delete: (id: string, userId: string) => Promise<void>;
    allowedUpdateFields: string[];
  }
) {
  return {
    // GET /api/[entity]
    list: createApiHandler(
      async ({ user }, { query }) => {
        return await options.findMany(user.id, query);
      },
      { requireAuth: true }
    ),

    // GET /api/[entity]/[id]
    get: createApiHandler(
      async ({ user, params }) => {
        const entity = await options.findUnique(params!.id, user.id);
        if (!entity) {
          throw new SecurityError(`${entityName} not found`, 404, "NOT_FOUND");
        }
        return entity;
      },
      { requireAuth: true }
    ),

    // POST /api/[entity]
    create: createApiHandler(
      async ({ user }, { body }) => {
        return await options.create(body, user.id);
      },
      { requireAuth: true }
    ),

    // PATCH /api/[entity]/[id]
    update: createApiHandler(
      async ({ user, params }, { body }) => {
        // Verify entity exists and user owns it
        const existing = await options.findUnique(params!.id, user.id);
        if (!existing) {
          throw new SecurityError(`${entityName} not found`, 404, "NOT_FOUND");
        }

        return await options.update(params!.id, body, user.id);
      },
      { requireAuth: true }
    ),

    // DELETE /api/[entity]/[id]
    delete: createApiHandler(
      async ({ user, params }) => {
        // Verify entity exists and user owns it
        const existing = await options.findUnique(params!.id, user.id);
        if (!existing) {
          throw new SecurityError(`${entityName} not found`, 404, "NOT_FOUND");
        }

        await options.delete(params!.id, user.id);
        return { success: true };
      },
      { requireAuth: true }
    ),
  };
}