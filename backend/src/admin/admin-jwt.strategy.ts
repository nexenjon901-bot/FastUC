import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    configService: ConfigService,
    private adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: any) {
    if (payload.typ !== 'admin' && payload.role !== 'SUPERADMIN' && payload.role !== 'MODERATOR') {
      throw new UnauthorizedException('Admin token required');
    }
    const admin = await this.adminService.findAdminById(payload.sub);
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException();
    }
    return { id: admin.id, email: admin.email, role: admin.role };
  }
}
