// src/common/decorators/require-permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMS_KEY = 'require_perms';
export const RequirePermissions = (...perms: string[]) =>
  SetMetadata(REQUIRE_PERMS_KEY, perms);
