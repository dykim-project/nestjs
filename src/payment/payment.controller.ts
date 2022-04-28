import { Controller, Res } from '@nestjs/common';
import { Response } from 'express';
import { Basket } from 'src/entity/basket.entity';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}


        //장바구니에서 결제하기 클릭했을때 결제 process
        async payment(@Res() res: Response){
        //장바구니 정보 조회
        const basketInfo = await this.paymentService.getBasketInfo();
        //1.장바구니 최종 재고 확인
        const chkStock = basketInfo.every(async data=> {
           await this.paymentService.chkBasketStock(data);//재고확인
        }); 
        if(!chkStock) {
            //response 
        }
        //2. 외부api regist_cart로 주문서 등록 
        await this.paymentService.registCart();

        //4.regist_cart 성공 후 - 주문상세tb 저장
        //5.주문상세tb 등록 후 주문tb 총금액 update 
        await this.paymentService.orderDetailSave(basketInfo);

        //6. 외부 api regist_order로 주문 등록!!
        await this.paymentService.registOrder();
        
        //---nice pay결제---------------------- 
        //6.결제 인증요청(nicepayment 인증요청) 
        const nicepayAuthResult = await this.paymentService.nicepayAuth();
        //7.결제 승인요청(nicepayment 인증요청)
        await this.paymentService.nicepayApproval(nicepayAuthResult);
        
        //8.결제정보 주문db update
        await this.paymentService.orderDataUpdate(nicepayAuthResult);
        
        //9. payment_order_with_pg <-스마트 오더 진행..?
        //payResult_utf.php 참고
        await this.paymentService.orderWithPg(nicepayAuthResult);
        }
}
