import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CartService } from 'src/cart/cart.service';
import { order } from 'src/entity/order.entity';
import { orderDetail } from 'src/entity/orderDetail.entity';
import { userInfo } from 'src/entity/userInfo.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [SequelizeModule.forFeature([order, orderDetail, userInfo])],
  controllers: [PaymentController],
  providers: [PaymentService, CartService]
})
export class PaymentModule {}
