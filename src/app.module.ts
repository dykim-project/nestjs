import { MiddlewareConsumer, Module, NestModule, BadRequestException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RawbodyMiddleware } from './middleware/rawbody.middleware';
import { ProductsModule } from './products/products.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentModule } from './payment/payment.module';
import { APP_FILTER } from '@nestjs/core';
const { accountdb, mddb } = require('./config/db.dev.config');
const prodConfig = require('./config/db.prod.config');
//const dbConfig = process.env.NODE_ENV === 'dev' ? devConfig : prodConfig;

@Module({
  imports: [
  SequelizeModule.forRoot({
      ...accountdb
    }
  ),
  SequelizeModule.forRoot({
    ...mddb
    ,name: 'mddb'
  }
),
  ProductsModule,
  PaymentModule,],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_FILTER,
    useClass: BadRequestException,
  }],
})
export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawbodyMiddleware)
      .forRoutes('products'); //해당주소로 시작하는 url에 적용 
      consumer
      .apply(RawbodyMiddleware)
      .forRoutes('/'); //해당주소로 시작하는 url에 적용 
  }
}
