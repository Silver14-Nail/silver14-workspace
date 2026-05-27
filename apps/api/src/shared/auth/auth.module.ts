import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@/db/entities/auths/user.entity';

import { AuthService } from './auth.service';
import {
  CustomerJwtAuthGuard,
  JwtAuthGuard,
  OptionalCustomerJwtAuthGuard,
} from './guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [AuthService, CustomerJwtAuthGuard, JwtAuthGuard, OptionalCustomerJwtAuthGuard],
  exports: [
    TypeOrmModule,
    AuthService,
    CustomerJwtAuthGuard,
    JwtAuthGuard,
    OptionalCustomerJwtAuthGuard,
  ],
})
export class AuthModule {}
