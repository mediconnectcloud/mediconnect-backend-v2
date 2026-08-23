import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// DUMMY AUTH: reads the user's id/role from plain headers
// (x-user-id, x-user-role) instead of verifying a real Cognito JWT.
//
// This exists so role-based access control can be built and demoed now,
// in the exact shape it will keep later. Once Cognito is connected, only
// the body of canActivate() changes - decode and verify the real JWT from
// the Authorization header instead of reading these headers - and every
// @Roles(...) decorator across the app keeps working unchanged.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const userRole = request.headers['x-user-role'];

    if (!requiredRoles || requiredRoles.length === 0) {
      // Public endpoint - still attach whatever identity was given, but don't require it.
      request.user = userId ? { username: userId, role: userRole } : undefined;
      return true;
    }

    if (!userId || !userRole) {
      throw new UnauthorizedException(
        'Missing x-user-id / x-user-role headers (dummy auth - a real Cognito token replaces these).',
      );
    }
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(`Role '${userRole}' cannot access this endpoint.`);
    }

    request.user = { username: userId, role: userRole };
    return true;
  }
}
