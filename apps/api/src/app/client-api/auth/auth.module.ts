import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@/db/entities/auths/user.entity';
import { PasswordResetEntity } from '@/db/entities/auths/password-resets.entity';

import { ClientAuthController } from './auth.controller';
import { ClientAuthService } from './auth.service';
import { ClientJwtAuthGuard } from './guards/client-jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PasswordResetEntity])],
  controllers: [ClientAuthController],
  providers: [ClientAuthService, ClientJwtAuthGuard],
  exports: [ClientJwtAuthGuard],
})
export class ClientAuthModule {}
