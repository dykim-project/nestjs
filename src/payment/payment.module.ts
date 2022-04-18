import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { payment } from './payment.entity';
import { refund } from './refund.entity';

@Module({
  imports: [SequelizeModule.forFeature([payment]), SequelizeModule.forFeature([refund])], 
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}