import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentService } from 'src/component/payment/payment.service';
import { order } from 'src/entity/order.entity';
import { orderDetail } from 'src/entity/orderDetail.entity';
import { userInfo } from 'src/entity/userInfo.entity';
import { CartService } from '../cart/cart.service';
import { NcpayController } from './ncpay.controller';
import { NcpayService } from './ncpay.service';
@Module({
  imports: [SequelizeModule.forFeature([userInfo],'accountdb'),SequelizeModule.forFeature([order, orderDetail, userInfo])],
  controllers: [NcpayController],
  providers: [NcpayService, PaymentService, CartService],
})
export class NcpayModule {}
