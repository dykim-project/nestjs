import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { StoreService } from 'src/smartorder/store.service';
import { ProductService } from 'src/smartorder/product.service';

@Module({
  providers: [CartService, StoreService, ProductService],
  controllers: [CartController]
})
export class CartModule {}
