import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@/db/entities/auths/user.entity';
import { AddressEntity } from '@/db/entities/auths/address.entity';
import { OrderEntity } from '@/db/entities/orders/order.entity';
import { AuthModule } from '@/shared/auth/auth.module';

import { ClientUserService } from './user.service';
import { ClientUserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AddressEntity, OrderEntity]), AuthModule],
  providers: [ClientUserService],
  controllers: [ClientUserController],
})
export class ClientUserModule {}
