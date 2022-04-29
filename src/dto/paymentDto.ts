import { IsNotEmpty, IsNumber } from 'class-validator';
import { CommonDto } from './commonDto';

export class PaymentDto extends CommonDto {
    
    userId: string;
    userName: string;
    userTel: string;
    osType: string;
    customerReq: string;
    orderAddr: string; //자리번호
}