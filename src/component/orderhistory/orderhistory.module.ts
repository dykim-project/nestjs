import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderhistoryController } from './orderhistory.controller';
import { OrderhistoryService } from './orderhistory.service';
import { order } from 'src/entity/order.entity';
import { orderDetail } from 'src/entity/orderDetail.entity';
import { StoreService } from '../store/store.service';

@Module({
  imports:[SequelizeModule.forFeature([order, orderDetail])],
  providers: [OrderhistoryService, StoreService],
  controllers: [OrderhistoryController]
})
export class OrderhistoryModule {}
