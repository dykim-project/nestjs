import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {
        //결제하기 클릭했을때 결제 process

        //1.장바구니 최종 재고 확인
            //get_basket_info 외부 api로 품절확인 
        //2. 외부api regist_cart로 주문서 등록 주문번호 생성
        //3.주문tb 저장
        //4.regist_cart 성공 후 - 주문상세tb 저장
        //5.주문상세tb 등록 후 주문tb 총금액 update 
        //6. 외부 api regist_order로 주문 등록!!

        //---nice pay결제 
        //6.결제 인증요청(nicepayment 인증요청) 
        //  -exception 시 errorcode response
        //7.결제 승인요청(nicepayment 인증요청)
        //-exception 시 nice 망취소 진행 errorcode response
        //8.결제정보 주문db update
        //9. payment_order_with_pg <-kis server 진행 
        //-exception 시 결제 취소 errorcode response

    }
}
