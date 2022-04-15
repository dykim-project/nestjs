import { Body, Controller, Get, Post, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Request } from 'express';
import { logger } from '../config/winston';
import { ValidationPipe } from 'src/validation/validation';
const { createProductSchma, createCatSchema }= require('./productSchema');
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post('list')
    getHello(req: Request): string {
      return this.productsService.getHello();
    }

    @Post('products')
    @UsePipes(new ValidationPipe(createProductSchma))
    getProducts(@Body()  product: ProductDto): ProductDto {
      logger.info(`controller ${product.name}`);
      return this.productsService.getProject();
    }

}
