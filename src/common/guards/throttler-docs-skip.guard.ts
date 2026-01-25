import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

/**
 * Applies ThrottlerGuard but skips rate limiting for Swagger UI and OpenAPI JSON
 * (e.g. /docs, /api/docs, /docs-json, /api/docs-json).
 */
@Injectable()
export class ThrottlerDocsSkipGuard extends ThrottlerGuard {
  private static readonly SKIP_PATHS = ['/docs', '/docs-json', '/api/docs', '/api/docs-json'];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path ?? request.url?.split('?')[0] ?? '';
    if (ThrottlerDocsSkipGuard.SKIP_PATHS.some((p) => path === p || path.startsWith(p + '/'))) {
      return true;
    }
    return super.canActivate(context);
  }
}
