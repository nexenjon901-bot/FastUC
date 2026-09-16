import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController, AdminJwtGuard } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '24h') as any },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AdminService, AdminJwtGuard],
  controllers: [AdminController],
  exports: [AdminJwtGuard],
})
export class AdminModule {}
