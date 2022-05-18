import { IsNotEmpty, IsNumber } from 'class-validator';
import { CommonDto } from './commonDto';

export class PaymentDto extends CommonDto {
    userId: string;
    userName: string;
    userTel: string;
    osType: string;
    customerReq: string;
    orderAddr: string; //자리번호
    orderId: string; //api에서 생성한 값 
    totalPrice: number = 0;
    sumProductQty: number = 0; //상품 총갯수
    email: string;
    name: string;
    goodsCount: number = 0;
    usedPoint: number =0;
    userCouponIdx: number;
    couponDiscount: number = 0;
    payType: string = ''; //NCPAY, NICEPAY
    pwd: string = '';
    cardId: string = '';
    calAmt: number = 0;
    couponName: string = '';
    discountAmt: number = 0;
}