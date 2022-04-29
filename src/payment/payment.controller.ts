import { Body, Controller, ForbiddenException, InternalServerErrorException, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { CartService } from 'src/cart/cart.service';
import { PaymentDto } from 'src/dto/paymentDto';
import { Basket } from 'src/entity/basket.entity';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService,
                private readonly cartService: CartService) {}

    //장바구니에서 결제하기 클릭했을때 결제 process
    async payment(@Req() req: Request, @Res() res: Response, @Body() paymentDto: PaymentDto ){

        //장바구니 정보 조회
        const basketInfo = await this.cartService.getCartList(111111);
        //1.장바구니 최종 재고 확인
        const chkStock = basketInfo.every(async data=> {
            await this.cartService.chkBasketStock(data);//재고확인
        }); 
        if(!chkStock) {
            //response 
            //front - "주문할 수 없는 메뉴입니다."
            throw new InternalServerErrorException('FORBIDDEN_MENU');
        }
        //2. 외부api regist_cart로 주문서 등록 
        await this.paymentService.registCart(req);

        //4.주문상세tb 저장 & 주문tb 총금액 update 
        await this.paymentService.orderDetailSave(basketInfo);

        //6. 외부 api regist_order로 주문서 접수 
        await this.paymentService.registOrder();
        
        //---nice pay결제---------------------- 
        //6.결제 인증요청(nicepayment 인증요청)  payRequest_utf.php 참고
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
