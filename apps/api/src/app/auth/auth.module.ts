import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CustomerJwtAuthGuard, JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenService } from './token.service';
import { TotpService } from './totp.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CustomerJwtAuthGuard, JwtAuthGuard, TokenService, TotpService],
})
export class AuthModule {}
