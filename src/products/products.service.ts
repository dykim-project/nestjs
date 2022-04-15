import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { ProductRepository } from './entity/productRepository';
@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: ProductRepository,
      ) {}
    
      findAll(): Promise<Product[]> {
        return this.productRepository.find();
      }
    getHello(): string {
    return 'Hello World!';
    }
    getProject(): ProductDto {
        let product = {name: "name"}
        return product;
    }
}
