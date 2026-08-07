import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ProductsController,
  ProductOrdersController,
  AdminProductsController,
} from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [PrismaModule, forwardRef(() => BotModule)],
  controllers: [ProductsController, ProductOrdersController, AdminProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
