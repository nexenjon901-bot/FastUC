import { Module } from '@nestjs/common';
import { TopupService } from './topup.service';
import { TopupController } from './topup.controller';

@Module({
  providers: [TopupService],
  controllers: [TopupController],
  exports: [TopupService],
})
export class TopupModule {}
