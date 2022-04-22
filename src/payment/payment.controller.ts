import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {
        //결제하기 클릭했을때 결제 process

        //1.장바구니 최종 재고 확인
        //2.주문 db저장, 주문상세 db 저장
        //3.결제 인증요청(nicepayment 인증요청) 
        //  -exception 시 errorcode response
        //4.결제 승인요청(nicepayment 인증요청)
        //-exception 시 nice 망취소 진행 errorcode response
        //5.결제정보 주문db update
        //6. payment_order_with_pg <-kis server 진행 
        //-exception 시 결제 취소 errorcode response

    }
}
