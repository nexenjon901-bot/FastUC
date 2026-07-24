import { Module, forwardRef } from '@nestjs/common';
import { TopupService } from './topup.service';
import { TopupController } from './topup.controller';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [forwardRef(() => BotModule)],
  providers: [TopupService],
  controllers: [TopupController],
  exports: [TopupService],
})
export class TopupModule {}
