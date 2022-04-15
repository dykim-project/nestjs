import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const bodyParser = require("body-parser");
const express = require('express');
import { RequestInterceptor } from './interceptor/request.interceotor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(express.text()); 
  app.useGlobalInterceptors(new RequestInterceptor());
  await app.listen(3000);
}
bootstrap();
