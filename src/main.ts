import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from "helmet";

const bodyParser = require("body-parser");
const express = require('express');
import { RequestInterceptor } from './interceptor/request.interceotor';
import { AllExceptionsFilter } from './exception/all.exception';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(express.text()); 
  const httpAdapterHost  = app.get(HttpAdapterHost);
  //app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalInterceptors(new RequestInterceptor());
  await app.listen(3000);
}
bootstrap();
