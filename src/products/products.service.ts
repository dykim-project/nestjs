import { Injectable } from '@nestjs/common';
@Injectable()
export class ProductsService {
    getHello(): string {
    return 'Hello World!';
    }
    getProject(): ProductDto {
        let product = {name: "name"}
        return product;
    }
}
