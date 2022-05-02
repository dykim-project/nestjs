import { Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Render, Req, Res, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response } from 'express';
import { sample } from '../entity/sample.entity';
import { SampleService } from './sample.service';
import { sample2 } from 'src/entity/sample2.entity';
import { CommonDto } from 'src/dto/commonDto';
import { ProductDto } from 'src/dto/productDto';
import { PaymentService } from 'src/payment/payment.service';
import { InjectModel } from '@nestjs/sequelize';
import { userInfo } from 'src/entity/userInfo.entity';
import { CartService } from 'src/cart/cart.service';
@Controller('sample')
export class SampleController {
    constructor(private readonly usersService: SampleService,
      private readonly paymentService: PaymentService,
      private readonly cartService: CartService,
      @InjectModel(userInfo)
      private userInfoModel: typeof userInfo
      ) {}

    @Get()
    async findAll(@Req() req: Request): Promise<sample[]> {
      //await this.paymentService.registCart(req);
      //1.장바구니 정보 가져와서 같은 가게가 아니면 장바구니 삭제 
      //const cartList = await this.cartService.getCartList(uid);
      return this.usersService.findAll();
    }

    @Post('common')
    getCommon(@Body() productDto: ProductDto): any {
      return productDto;
    }
    
    // @Get('product')
    // findAllProduct(): Promise<sample2[]> {
    //   return this.usersService.productAll();
    // }

    @Get('getone/:id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<void> {
      return this.usersService.findOne(id);
    }

    @Get('getelse/:id')
    findElse(@Param('id') id: string): void {
      return this.usersService.findElse(id);
    }

    @Post('create')
    create(@Body() product: sample): Promise<void> {
      console.log(product);
      return this.usersService.create();
    }

    @Post('findcreate')
    findAndCreate(@Body('name') name: string): Promise<void> {
      return this.usersService.findAndCreate(name);
    }

    @Post('update')
    update(@Res() res: Response): void {
      return this.usersService.update( res );
    }

    // @Get('joinFind/:id')
    // joinFind(@Param('id') id: string): Promise<sample[]> {
    //   return this.usersService.joinFind(id);
    // }

    // @Get('joinFind2/:id')
    // //@Redirect('https://docs.nestjs.com', 302)
    //  async joinFind2(@Param('id') id: string, res: Response): Promise<sample[]> {
    //   return this.usersService.joinFind2(id);
    // }


}
