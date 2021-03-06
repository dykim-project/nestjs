import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CartService } from 'src/component/cart/cart.service';
import { order } from 'src/entity/order.entity';
import { orderDetail } from 'src/entity/orderDetail.entity';
import { PaymentService } from 'src/component/payment/payment.service';
import { ProductService } from './product.service';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { userInfo } from 'src/entity/userInfo.entity';
@Module({
  imports: [SequelizeModule.forFeature([order, orderDetail])
          ,SequelizeModule.forFeature([userInfo],'accountdb')],
  controllers: [StoreController],
  providers: [StoreService, ProductService, PaymentService, CartService],
})
export class StoreModule {}
