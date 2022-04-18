import { IsEmail, IsNotEmpty, IsNumberString} from 'class-validator';

export class ProductDto {
    @IsNotEmpty()
    name: string;
    @IsNumberString()
    id: number;

}