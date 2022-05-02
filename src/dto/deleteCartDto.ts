import { IsNotEmpty, IsNumber } from 'class-validator';
import { CommonDto } from './commonDto';

export class DeleteCartDto {
    @IsNotEmpty()
    uid: number;
    
    basketDetailId: string;

}