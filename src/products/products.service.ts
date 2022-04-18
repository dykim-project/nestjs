import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { product } from '../entity/product.entity';
import { ProductDto } from '../dto/productDto';
@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(product)
        private readonly productModel: typeof product,
    ) {}
    
    async findAll(): Promise<product[]> {
        return this.productModel.findAll();
    }
    getHello(): string {
    return 'Hello World!';
    }
    getProject(): ProductDto {
        let product = {name: "name", id:0}
        return product;
    }

    

}
