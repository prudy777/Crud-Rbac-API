import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './services/prisma.service';

function parseExpiresInToSeconds(v?: string): number {
  // Accept plain seconds or “Xd / Xh / Xm / Xs”
  if (!v) return 60 * 60 * 24 * 7; // 7 days default
  const m = /^(\d+)([smhdw])?$/.exec(v.trim());
  if (!m) return Number(v) || 60 * 60 * 24 * 7;
  const n = Number(m[1]);
  const unit = m[2];
  const mult =
    unit === 's' ? 1 :
    unit === 'm' ? 60 :
    unit === 'h' ? 3600 :
    unit === 'd' ? 86400 :
    unit === 'w' ? 604800 : 1;
  return n * mult;
}

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret_change_me',
      // supply a NUMBER (seconds) to satisfy the type
      signOptions: { expiresIn: parseExpiresInToSeconds(process.env.JWT_EXPIRES_IN) },
    }),
  ],
  providers: [PrismaService],
  exports: [PrismaService, JwtModule],
})
export class CoreModule {}
