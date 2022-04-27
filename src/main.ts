import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from "helmet";
import { urlencoded } from 'body-parser';
import { text } from 'express';
import { RequestInterceptor } from './interceptor/request.interceotor';
import { AllExceptionsFilter } from './exception/allCatch.exception';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/transform.interceptor';
require('dotenv').config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule,  { cors: true });
  app.enableCors();
  app.use(helmet());
  app.use(urlencoded({extended: true}));
  app.use(text()); 
  const httpAdapterHost  = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalPipes(new ValidationPipe({forbidNonWhitelisted: true}));
  //app.useGlobalInterceptors(new RequestInterceptor());
  //app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(3000);
}
bootstrap();
