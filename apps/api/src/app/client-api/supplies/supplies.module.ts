import { Module } from '@nestjs/common';
import { ClientProductsModule } from '../products/products.module';
import { ClientSuppliesController } from './supplies.controller';

@Module({
  imports: [ClientProductsModule],
  controllers: [ClientSuppliesController],
})
export class ClientSuppliesModule {}
