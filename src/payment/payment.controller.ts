import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Response } from 'express';
import { payment } from '../entity/payment.entity';
import { PaymentService } from './payment.service';
import { refund } from '../entity/refund.entity';

@Controller('payment')
export class PaymentController {
    constructor(private readonly usersService: PaymentService) {}

    @Get()
    findAll(): Promise<payment[]> {
      return this.usersService.findAll();
    }
    @Get('getone/:id')
    
    findOne(@Param('id', ParseIntPipe) id: number): Promise<void> {
      return this.usersService.findOne(id);
    }

    @Get('getelse/:id')
    findElse(@Param('id') id: string): void {
      return this.usersService.findElse(id);
    }

    @Post('create')
    create(): Promise<void> {
      return this.usersService.create();
    }

    @Post('update')
    update(res: Response): void {
      return this.usersService.update( res );
    }

    @Get('joinFind/:id')
    joinFind(@Param('id') id: string): Promise<payment[]> {
      return this.usersService.joinFind(id);
    }

    @Get('joinFind2/:id')
    joinFind2(@Param('id') id: string): Promise<payment[]> {
      return this.usersService.joinFind2(id);
    }

    @Get('refund') //ket 없어도 진행되는지 test
    createRefund(): Promise<refund> {
      return this.usersService.createRefund();
    }
  

}
