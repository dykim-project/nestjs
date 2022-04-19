import { IsEmail, IsNotEmpty, IsNumberString, IsNumber} from 'class-validator';

export class ProductDto {
    @IsNotEmpty()
    name: string;
    @IsNumberString()//number인 string으로 
    id: number;
    @IsNumber()
    num: number;

}