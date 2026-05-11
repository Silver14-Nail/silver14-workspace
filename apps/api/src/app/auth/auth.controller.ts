import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';
import { EnableTwoFactorDto } from './dto/enable-two-factor.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto';
import { CustomerJwtAuthGuard, JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('2fa/verify')
  verifyTwoFactor(@Body() body: VerifyTwoFactorDto) {
    return this.authService.verifyAdminTwoFactor(body.challengeId, body.code);
  }

  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  setupTwoFactor(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.createAdminTwoFactorSetup(user.id);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  enableTwoFactor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: EnableTwoFactorDto,
  ) {
    return this.authService.enableAdminTwoFactor(user.id, body.code);
  }

  @Post('customer/register')
  registerCustomer(@Body() body: RegisterCustomerDto) {
    return this.authService.registerCustomer(
      body.email,
      body.password,
      body.name,
    );
  }

  @Post('customer/login')
  loginCustomer(@Body() body: LoginDto) {
    return this.authService.loginCustomer(body.email, body.password);
  }

  @Post('customer/refresh')
  refreshCustomer(@Body() body: RefreshTokenDto) {
    return this.authService.refreshCustomer(body.refreshToken);
  }

  @Get('customer/me')
  @UseGuards(CustomerJwtAuthGuard)
  getCustomerMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
