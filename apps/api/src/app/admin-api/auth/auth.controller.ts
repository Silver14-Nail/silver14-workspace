import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { type PassedAuthMiddlewareRequest } from '../admin-api.middleware';

import { AdminAuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRefreshTokenDto } from './dto/admin-refresh-token.dto';

@ApiTags('Admin - Auth')
@Controller('auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AdminLoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: AdminRefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  getMe(@Req() req: PassedAuthMiddlewareRequest) {
    return this.authService.getMe(req.user.id);
  }
}
