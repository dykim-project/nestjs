import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from "helmet";
import { urlencoded } from 'body-parser';
import { text } from 'express';
import { RequestInterceptor } from './interceptor/request.interceotor';
import { AllExceptionsFilter } from './exception/allCatch.exception';
import { ValidationPipe } from '@nestjs/common';
const cookieParser = require('cookie-parser');
require('dotenv').config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors:true});
  //app.use(helmet());
  app.use(urlencoded({extended: true}));
  app.use(text()); 
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({forbidNonWhitelisted: true}));
  app.useGlobalInterceptors(new RequestInterceptor());

  await app.listen(3000);
}
bootstrap();
