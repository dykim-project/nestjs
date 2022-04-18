import { Controller, Get, Param, Post } from '@nestjs/common';
import { Response } from 'express';
import { payment } from './payment.entity';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly usersService: PaymentService) {}

    @Get()
    findAll(): Promise<payment[]> {
      return this.usersService.findAll();
    }
    @Get('getone/:id')
    findOne(@Param('id') id: string): Promise<payment> {
      return this.usersService.findOne(id);
    }

    @Get('getelse/:id')
    findElse(@Param('id') id: string): void {
      return this.usersService.findElse(id);
    }

    @Post('create')
    create(): Promise<payment> {
      return this.usersService.create();
    }

    @Post('update')
    update(res: Response): void {
      return this.usersService.update( res );
    }
  

}
