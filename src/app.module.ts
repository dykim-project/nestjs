import { MiddlewareConsumer, Module, NestModule, BadRequestException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RawbodyMiddleware } from './middleware/rawbody.middleware';
import { SequelizeModule } from '@nestjs/sequelize';
import { SampleModule } from './sample/sample.module';
import { APP_FILTER } from '@nestjs/core';
import { StoreModule } from './store/store.module';
import { PaymentModule } from './payment/payment.module';
import { CartModule } from './cart/cart.module';
import { OrderhistoryModule } from './orderhistory/orderhistory.module';
const devConfig = require('./config/db.dev.config');
const prodConfig = require('./config/db.prod.config');
const dbConfig = process.env.NODE_ENV == 'dev' ? prodConfig : devConfig;
@Module({
  imports: [
  SequelizeModule.forRoot({
      ...dbConfig
    }
  ), 
  SampleModule,
  StoreModule,
  PaymentModule,
  CartModule,
  OrderhistoryModule,],
  controllers: [AppController],
  providers: [AppService, {
      provide: APP_FILTER,
      useClass: BadRequestException,
    },
],
})
export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
      consumer
      .apply(RawbodyMiddleware)
      .forRoutes('/'); //해당주소로 시작하는 url에 적용 
  }
}
