import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      name: 'nail-commerce-api',
      status: 'ok',
    } as const;
  }
}
