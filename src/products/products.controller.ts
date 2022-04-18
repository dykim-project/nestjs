import { Body, Controller, Get, Post, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Request } from 'express';
import { logger } from '../config/winston';
import { product } from '../entity/product.entity';
import { ProductDto } from '../dto/productDto';
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post('list')
    getHello(req: Request): string {
      return this.productsService.getHello();
    }

    @Post('findall')
    @UsePipes(new ValidationPipe())
    getProductsAll(@Body()  product: ProductDto): Promise<product[]> {
      logger.info(`controller find all test ${product.name}`);
      return this.productsService.findAll();
    }

}
