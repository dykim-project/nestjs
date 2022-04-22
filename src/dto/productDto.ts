import { IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';

export class ProductDto {
    @IsNotEmpty()
    @IsNumberString()
    uid: number;

    @IsNotEmpty()
    productId: string;

    @IsNotEmpty()
    productCnt: number;

    storeId: string;
}