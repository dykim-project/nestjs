import { IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';

export class NcpayDto {
    ncPayId: string;
    orderId: string;
    name: string;
    email: string;
    userTel: string;
    GoodsName: string;
    amt: number; //결제 금액
    //payPwd: string;
    uid: number;
    couponIdx: number;
    point: number;
    storeId: string;
}