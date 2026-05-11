import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return API health status', () => {
      expect(service.getHealth()).toEqual({
        name: 'nail-commerce-api',
        status: 'ok',
      });
    });
  });
});
