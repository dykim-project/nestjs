import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Response } from 'express';
import { payment } from '../entity/payment.entity';
import { PaymentService } from './payment.service';
import { refund } from '../entity/refund.entity';
import { ProductDto } from 'src/dto/productDto';
import { product } from 'src/entity/product.entity';
@Controller('payment')
export class PaymentController {
    constructor(private readonly usersService: PaymentService) {}

    @Get()
    findAll(): Promise<payment[]> {
      return this.usersService.findAll();
    }
    
    @Get('product')
    findAllProduct(): Promise<product[]> {
      return this.usersService.productAll();
    }

    @Get('getone/:id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<void> {
      return this.usersService.findOne2(id);
    }

    @Get('getelse/:id')
    findElse(@Param('id') id: string): void {
      return this.usersService.findElse(id);
    }

    @Post('create')
    create(@Body() product: ProductDto): Promise<void> {
      console.log(product);
      return this.usersService.create();
    }

    @Post('findcreate')
    findAndCreate(@Body('name') name: string): Promise<void> {
      return this.usersService.findAndCreate(name);
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
    //@Redirect('https://docs.nestjs.com', 302)
     async joinFind2(@Param('id') id: string, res: Response): Promise<payment[]> {
      return this.usersService.joinFind2(id);
    }

    @Get('refund') 
    createRefund(): Promise<refund> {
      return this.usersService.createRefund();
    }
  

}
