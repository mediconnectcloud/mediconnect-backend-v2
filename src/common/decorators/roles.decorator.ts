import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Usage: @Roles('provider') above a controller method.
// Mirrors the IAM least-privilege model from the architecture plan, just
// enforced in application code until real IAM/Cognito roles exist.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
