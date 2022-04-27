import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';
import { CommonDto } from './commonDto';

export class ProductDto extends   PartialType(CommonDto){
    @IsNotEmpty()
    @IsNumberString()
    readonly uid: number;

    @IsNotEmpty()
    productId: string;

    @IsNotEmpty()
    productCnt: number;

    storeId: string;
}