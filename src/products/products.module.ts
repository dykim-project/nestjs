import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { product } from '../entity/product.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([product])], 
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

