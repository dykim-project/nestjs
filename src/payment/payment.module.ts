import { Module } from '@nestjs/common';
import { CartService } from 'src/cart/cart.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, CartService]
})
export class PaymentModule {}
