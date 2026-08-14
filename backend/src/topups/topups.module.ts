import { Module } from '@nestjs/common';
import { TopupsService } from './topups.service';
import { TopupsController } from './topups.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TopupsController],
  providers: [TopupsService],
  exports: [TopupsService],
})
export class TopupsModule {}
