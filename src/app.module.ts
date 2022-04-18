import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RawbodyMiddleware } from './middleware/rawbody.middleware';
import { ProductsModule } from './products/products.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentModule } from './payment/payment.module';
const devConfig = require('./config/db.dev.config');
const prodConfig = require('./config/db.prod.config');
const dbConfig = process.env.NODE_ENV === 'dev' ? devConfig : prodConfig;

@Module({
  imports: [
  SequelizeModule.forRoot({
      ...devConfig
    }
  ),
  ProductsModule,
  PaymentModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawbodyMiddleware)
      .forRoutes('products'); //해당주소로 시작하는 url에 적용 
  }
}
