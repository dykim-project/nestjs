import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CartService } from 'src/cart/cart.service';
import { order } from 'src/entity/order.entity';
import { orderDetail } from 'src/entity/orderDetail.entity';
import { userInfo } from 'src/entity/userInfo.entity';
import { PaymentService } from 'src/payment/payment.service';
import { OrderHistoryService } from './orderhistory.service';
import { ProductService } from './product.service';
import { SmartorderController } from './smartorder.controller';
import { StoreService } from './store.service';

@Module({
  imports: [SequelizeModule.forFeature([order, orderDetail, userInfo])],
  controllers: [SmartorderController],
  providers: [StoreService, ProductService, PaymentService, CartService, OrderHistoryService],
})
export class SmartorderModule {}
