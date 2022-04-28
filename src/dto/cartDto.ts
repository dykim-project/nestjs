import { IsNotEmpty, IsNumber } from 'class-validator';
import { CommonDto } from './commonDto';

export class CartDto extends CommonDto {
    @IsNotEmpty()
    user_name: string;
    @IsNotEmpty()
    push_token: string;

}