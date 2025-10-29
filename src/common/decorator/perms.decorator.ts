import { SetMetadata } from '@nestjs/common';
export const PERMS_KEY = 'perms';
export const Perms = (...slugs: string[]) => SetMetadata(PERMS_KEY, slugs);
