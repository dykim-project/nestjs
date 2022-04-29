import { IsNotEmpty, IsNumber } from 'class-validator';
import { CommonDto } from './commonDto';
import { ProductDto } from './productDto';

export class AddCartDto extends ProductDto {
    @IsNotEmpty()
    itemId: string;
    @IsNotEmpty()
    itemQty: number;

}