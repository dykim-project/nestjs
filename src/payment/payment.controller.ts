import { Body, Controller, ForbiddenException, InternalServerErrorException, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { CartService } from 'src/cart/cart.service';
import { PaymentDto } from 'src/dto/paymentDto';
import { Basket } from 'src/entity/basket.entity';
import { PaymentService } from './payment.service';
import { common } from '../utils/common';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService,
                private readonly cartService: CartService) {}

    //장바구니에서 결제하기 클릭했을때 결제 process
    async payment(@Req() req: Request, @Res() res: Response, @Body() paymentDto: PaymentDto ){

        //장바구니 정보 조회
        const basketInfo = await this.cartService.getCartList(paymentDto.uid);
        //1.장바구니 최종 재고 확인
        await basketInfo.every(async data => {
            let itemStatusCode = data.prdSaleCdStk;
            if(itemStatusCode != 'OS') {
                res.json({ststusCode:204, resultMsg: 'FORBIDDEN_MENU'})
            }
        }); 
        //2. 외부api regist_cart로 주문서 등록 
        let resultDto = await this.paymentService.registCart(paymentDto);

        //4.주문상세tb 저장 & 주문tb 총금액 update 
        resultDto = await this.paymentService.orderDetailSave(basketInfo, paymentDto);

        //6. 외부 api regist_order로 주문서 접수 
        await this.paymentService.registOrder(paymentDto);
        
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
