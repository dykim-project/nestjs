import { Module } from '@nestjs/common';
import { PaymentService } from 'src/payment/payment.service';
import { CartService } from './cart.service';
import { ProductService } from './product.service';
import { SmartorderController } from './smartorder.controller';
import { StoreService } from './store.service';

@Module({
  controllers: [SmartorderController],
  providers: [StoreService, ProductService, PaymentService, CartService],
})
export class SmartorderModule {}
