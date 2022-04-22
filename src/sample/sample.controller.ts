import { Body, Controller, Get, Param, ParseIntPipe, Post, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { sample } from '../entity/sample.entity';
import { SampleService } from './sample.service';
import { sample2 } from 'src/entity/sample2.entity';
@Controller('sample')
export class SampleController {
    constructor(private readonly usersService: SampleService) {}

    @Get()
    findAll(): Promise<sample[]> {
      return this.usersService.findAll();
    }
    
    @Get('product')
    findAllProduct(): Promise<sample2[]> {
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
