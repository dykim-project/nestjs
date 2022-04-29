import { PartialType } from '@nestjs/mapped-types';
import { ArrayContains, IsEnum, IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';
import { CommonDto } from './commonDto';

enum orderType {
    order = 'order',
    addcart = 'addcart'
}
export class ProductDto extends PartialType(CommonDto) {
    @IsNotEmpty() 
    @IsEnum(orderType)
    orderType: string;
}