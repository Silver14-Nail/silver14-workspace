import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      name: 'nail-commerce-api',
      status: 'ok',
      version: 'v0.0.7',
    } as const;
  }
}
