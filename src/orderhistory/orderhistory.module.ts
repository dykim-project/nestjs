import { Module } from '@nestjs/common';
import { OrderhistoryController } from './orderhistory.controller';
import { OrderhistoryService } from './orderhistory.service';

@Module({
  providers: [OrderhistoryService],
  controllers: [OrderhistoryController]
})
export class OrderhistoryModule {}
