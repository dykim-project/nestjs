import { IsNotEmpty, IsNumber } from 'class-validator';

export class CommonDto {
    @IsNotEmpty()
    storeId: string;
    @IsNumber()
    uid: number;

}