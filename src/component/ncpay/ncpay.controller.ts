import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { NcpayDto } from 'src/dto/ncPayDto';
import { NcpayService } from './ncpay.service';
@Controller('/ncpay')
export class NcpayController {
  constructor(private readonly ncpayService: NcpayService) {}

  @Get()
  async getNcpay(@Res() res: Response, @Query('uid') uid: number) {
    let result = await this.ncpayService.getNcPay(uid);
    res.json(result);
  }

  @Post('/pay')
  async payNcpay( @Res() res: Response,  @Body() ncpayDto: NcpayDto) {
    let result = await this.ncpayService.payNcpay(ncpayDto, res);
  }

  @Post('/cancel') 
  async payNcpayCancel() {
    let result = await this.ncpayService.cancelNcpay();
  }

}
