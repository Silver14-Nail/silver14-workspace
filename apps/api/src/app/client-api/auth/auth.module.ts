import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@/db/entities/auths/user.entity';
import { PasswordResetEntity } from '@/db/entities/auths/password-resets.entity';
import { EmailModule } from '@/shared/email/email.module';

import { ClientAuthController } from './auth.controller';
import { ClientAuthService } from './auth.service';
import { ClientJwtAuthGuard } from './guards/client-jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PasswordResetEntity]), EmailModule],
  controllers: [ClientAuthController],
  providers: [ClientAuthService, ClientJwtAuthGuard],
  exports: [ClientJwtAuthGuard],
})
export class ClientAuthModule {}
