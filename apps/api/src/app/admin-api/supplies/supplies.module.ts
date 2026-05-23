import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { AdminSuppliesController } from './supplies.controller';

@Module({
  imports: [ProductsModule],
  controllers: [AdminSuppliesController],
})
export class AdminSuppliesModule {}
