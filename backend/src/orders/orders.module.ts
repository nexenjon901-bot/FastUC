import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { UsersModule } from '../users/users.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    UsersModule,
    // Optional: Add BullModule for delayed jobs (e.g., auto-confirm in 48 hours)
    /*
    BullModule.registerQueue({
      name: 'orders',
    }),
    */
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
