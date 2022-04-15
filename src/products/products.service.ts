import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { product } from './entity/product.entity';
import { ProductRepository } from './entity/productRepository';
@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(product)
        private readonly productModel: typeof product,
    ) {}
    
    async findAll(): Promise<product[]> {
        return this.productModel.findAll();
    }
    getHello(): string {
    return 'Hello World!';
    }
    getProject(): ProductDto {
        let product = {name: "name"}
        return product;
    }

    

}
