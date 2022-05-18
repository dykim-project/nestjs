import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CartService } from 'src/component/cart/cart.service';
import { order } from 'src/entity/order.entity';
import { orderDetail } from 'src/entity/orderDetail.entity';
import { userInfo } from 'src/entity/userInfo.entity';
import { StoreService } from 'src/component/store/store.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { NcpayService } from '../ncpay/ncpay.service';

@Module({
  imports: [SequelizeModule.forFeature([order, orderDetail, userInfo])],
  controllers: [PaymentController],
  providers: [PaymentService, CartService, StoreService,NcpayService]
})
export class PaymentModule {}
