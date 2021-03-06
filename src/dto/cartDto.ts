import { IsNotEmpty, IsNumber } from 'class-validator';
import { CommonDto } from './commonDto';

export class CartDto extends CommonDto {
    @IsNotEmpty()
    uid: number;
    
    @IsNotEmpty()
    userName: string;
    
    @IsNotEmpty()
    pushToken: string;

}