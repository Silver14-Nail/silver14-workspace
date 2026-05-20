import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '@/db/entities/auths/user.entity';
import { UserRole } from '@/common/enums/entity.enum';
import { TokenUtils } from '@/common/utils';
import type { EnvConfiguration } from '@/config/configuration';

@Injectable()
export class ClientJwtAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly configService: ConfigService<EnvConfiguration>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authHeader.split(' ')[1];

    let payload: { userId: string };
    try {
      payload = TokenUtils.verify<{ userId: string }>(token, this.secret);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userRepo.findOneBy({ id: payload.userId });

    if (!user || !user.isActive || user.role !== UserRole.CUSTOMER) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = { id: user.id, email: user.email, name: user.fullName, role: user.role };
    return true;
  }

  private get secret(): string {
    return this.configService.getOrThrow<string>('secret');
  }
}
