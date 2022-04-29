import { IsNotEmpty, IsNumber } from 'class-validator';
import { CommonDto } from './commonDto';

export class PaymentDto extends CommonDto {
    userId: string;
    userName: string;
    userTel: string;
    osType: string;
    customerReq: string;
    orderAddr: string; //자리번호
    orderId: string;
    totalPrice: number = 0;
    sumProductQty: number = 0; //상품 총갯수
}