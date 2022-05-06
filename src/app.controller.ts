import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/refresh')
  getRefresh() {
    // const refreshRequest = axios.create({
    //   baseURL: `${process.env.REACT_APP_AUTH_API_URL}`,
    // });
    //return token
    // return this.appService.getHello();
  }
}
