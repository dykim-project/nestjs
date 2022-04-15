import { Controller, Get, Param } from '@nestjs/common';
import { payment } from './payment.entity';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly usersService: PaymentService) {}

    @Get()
    findAll(): Promise<payment[]> {
      return this.usersService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string): Promise<payment> {
      return this.usersService.findOne(id);
    }

}
