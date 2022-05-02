import { Module } from '@nestjs/common';
import { SampleService } from './sample.service';
import { SampleController } from './sample.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { sample } from '../entity/sample.entity';
import { sample2 } from '../entity/sample2.entity';
import { PaymentService } from 'src/payment/payment.service';
import { orderDetail } from 'src/entity/orderDetail.entity';
import { order } from 'src/entity/order.entity';
import { userInfo } from 'src/entity/userInfo.entity';
import { CartService } from 'src/cart/cart.service';
@Module({
  imports: [SequelizeModule.forFeature([sample, order, orderDetail, userInfo])
 ], 
  providers: [SampleService, PaymentService, CartService],
  controllers: [SampleController]
})
export class SampleModule {}
