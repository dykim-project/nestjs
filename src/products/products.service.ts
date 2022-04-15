import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { ProductRepository } from './entity/productRepository';
@Injectable()
export class ProductsService {
    constructor(
        @Inject('PRODUCT_REPOSITORY')
        private productRepository: typeof Product

        // @InjectRepository(Product)
        // private productRepository: ProductRepository,
    ) {}
    
    async findAll(): Promise<Product[]> {
       return this.productRepository.findAll<Product>();
    }
    getHello(): string {
    return 'Hello World!';
    }
    getProject(): ProductDto {
        let product = {name: "name"}
        return product;
    }

    

}
