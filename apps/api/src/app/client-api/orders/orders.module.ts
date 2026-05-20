import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from '@/db/entities/orders/order.entity';
import { AuthModule } from '@/shared/auth/auth.module';

import { ClientOrdersController, ClientMyOrdersController } from './orders.controller';
import { ClientOrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity]), AuthModule],
  controllers: [ClientOrdersController, ClientMyOrdersController],
  providers: [ClientOrdersService],
})
export class ClientOrdersModule {}
