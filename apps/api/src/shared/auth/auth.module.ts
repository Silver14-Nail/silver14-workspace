import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CustomerJwtAuthGuard, JwtAuthGuard, OptionalCustomerJwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenService } from './token.service';
import { TotpService } from './totp.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CustomerJwtAuthGuard, JwtAuthGuard, OptionalCustomerJwtAuthGuard, TokenService, TotpService],
  exports: [AuthService, CustomerJwtAuthGuard, JwtAuthGuard, OptionalCustomerJwtAuthGuard, TokenService, TotpService],
})
export class AuthModule {}
