import { IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';

export class CommonDto {
    @IsNotEmpty()
    storeId: string;
    uid: number;

}