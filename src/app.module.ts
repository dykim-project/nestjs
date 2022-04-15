import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RawbodyMiddleware } from './middleware/rawbody.middleware';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
const devConfig = require('./config/db.dev.config');
const prodConfig = require('./config/db.prod.config');
@Module({
  imports: [TypeOrmModule.forRoot(process.env.NODE_ENV === 'dev' ? devConfig : prodConfig),
  // TypeOrmModule.forRootAsync({
  //             useFactory: () => (process.env.NODE_ENV === 'dev' ? devConfig : prodConfig),
  //           }),
            ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(private connection: Connection) {
    
  }
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawbodyMiddleware)
      .forRoutes('products'); //해당주소로 시작하는 url에 적용 
  }
}
