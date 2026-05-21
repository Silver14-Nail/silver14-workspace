import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@/db/entities/auths/user.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  CustomerJwtAuthGuard,
  JwtAuthGuard,
  OptionalCustomerJwtAuthGuard,
} from './guards/jwt-auth.guard';
import { TokenService } from './token.service';
import { TotpService } from './totp.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [
    AuthService,
    CustomerJwtAuthGuard,
    JwtAuthGuard,
    OptionalCustomerJwtAuthGuard,
    TokenService,
    TotpService,
  ],
  exports: [
    TypeOrmModule,
    AuthService,
    CustomerJwtAuthGuard,
    JwtAuthGuard,
    OptionalCustomerJwtAuthGuard,
    TokenService,
    TotpService,
  ],
})
export class AuthModule {}
