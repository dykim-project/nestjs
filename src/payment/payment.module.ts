import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { payment } from '../entity/payment.entity';
import { refund } from '../entity/refund.entity';
import { product } from '../entity/product.entity';
@Module({
  imports: [SequelizeModule.forFeature([payment, refund])
  ,SequelizeModule.forFeature([ product], 'mddb')
 ], 
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}
