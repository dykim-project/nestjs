import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { StoreService } from 'src/smartorder/store.service';
import { ProductService } from 'src/smartorder/product.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { userInfo } from 'src/entity/userInfo.entity';

@Module({
  imports:[SequelizeModule.forFeature([userInfo])],
  providers: [CartService, StoreService, ProductService],
  controllers: [CartController]
})
export class CartModule {}
