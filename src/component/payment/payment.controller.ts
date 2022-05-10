import { Body, Controller, ForbiddenException, Get, InternalServerErrorException, Post, Query, Redirect, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { CartService } from 'src/component/cart/cart.service';
import { PaymentDto } from 'src/dto/paymentDto';
import { Basket } from 'src/entity/basket.entity';
import { PaymentService } from './payment.service';
import { common } from '../../utils/common';
import { StoreService } from 'src/component/store/store.service';
import { nicepayApproval } from 'src/utils/nicepay.approval';
import { nicepayNetcancel } from 'src/utils/nicepay.netcancel';
import { MESSAGES } from '@nestjs/core/constants';
const config = require('../../config/config');
const crypto = require('crypto');
const iconv = require('iconv-lite');

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService,
                private readonly cartService: CartService,
                private readonly storeService: StoreService) {}

    //장바구니에서 결제하기 클릭했을때 결제 process
    @Post()
    async payment(@Req() req: Request, @Res() res: Response, @Body() paymentDto: PaymentDto ){
        //최종 open 확인 

        const storeOpenChk = await this.storeService.getStoreOpenChk(paymentDto.storeId);
        if(!storeOpenChk) {
            return res.json({ststusCode:200, resultMsg: 'NOT_OPEN'});
        }

        //장바구니 정보 조회
        const basketInfo = await this.cartService.getCartList(paymentDto.uid);
        //1.장바구니 최종 재고 확인
        await basketInfo.every(async data => {
            let itemStatusCode = data.prdSaleCdStk;
            if(itemStatusCode != 'OS') {
                return res.json({ststusCode:200, resultMsg: 'FORBIDDEN_MENU'})
            }
        }); 
        //2. 외부api regist_cart로 주문서 등록 
        await this.paymentService.registCart(paymentDto);
        //4.주문상세tb 저장 & 주문tb 총금액 update 
        await this.paymentService.orderDetailSave(basketInfo, paymentDto);

        //6. 외부 api regist_order로 주문서 접수 
        //const result = await this.paymentService.registOrder(paymentDto);
        //backand - goodsName, price, totalPRicd,userName, userEmail, usertel
        let goodName = basketInfo[0].prdNm + " " + paymentDto.sumProductQty + '개';
        if(basketInfo.length > 1) {
            goodName = basketInfo[0].prdNm + " 외 " + (paymentDto.goodsCount-1) + " 품목";
        }

        return res.json({statusCode: 200});
        //---nice pay결제---------------------- 
        //payment(rtn.order_id, rtn.store_id, rtn.pay_price, rtn.order_id);
        //6.결제 인증요청(nicepayment 인증요청)  payRequest_utf.php 참고
       // const nicepayAuthResult = await this.paymentService.nicepayAuth(paymentDto);
        //7.결제 승인요청(nicepayment 인증요청)
        //await this.paymentService.nicepayApproval(nicepayAuthResult);
        
        //8.결제정보 주문db update
        //await this.paymentService.orderDataUpdate(nicepayAuthResult);
        
        //9. payment_order_with_pg <-스마트 오더 진행..?
        //payResult_utf.php 참고
        //await this.paymentService.orderWithPg(nicepayAuthResult);
    }

    //장바구니에서 결제하기 클릭했을때 결제 process
    @Post('/test')
    async paymentTest(@Req() req: Request, @Res() res: Response, @Body() paymentDto: PaymentDto ){
        paymentDto.totalPrice = 500;
        paymentDto.userTel= '01047675027';


        paymentDto.orderId = '00000001489338';
        paymentDto.userName = '김다영';
        paymentDto.email = 'dykim5027@ddfactory.kr';
        //6. 외부 api regist_order로 주문서 접수 
        const now = common.getYYYYMMDDHHMMSS();
        let envalue =  now + config.MID + paymentDto.totalPrice + config.MKEY;
         // sha256Enc.encrypt(ediDate + merchantID + price + merchantKey);
        let encrypt = common.getSignData(envalue);
        let data = {userData: paymentDto,
            goodsName: '테스트상품 외 1개',
            totalPrice: paymentDto.totalPrice,
            ediDate: now,
            signData: encrypt,
            orderId: '00000001489338',
            //$hashString = bin2hex(hash('sha256', $ediDate.$MID.$price.$merchantKey, true));
            statusCode: 200
                    }
        console.log(data);
        return res.json(data);
    }

    async validationError(msg, res, cancelBody?) {
        console.log('validation Error');
        //fail update 
        await this.paymentService.updateOrderStatus(cancelBody.orderId, 'EC9999');
        const result =  await nicepayNetcancel(cancelBody);
        return res.send({
            body: `<html><script>alert('결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다 \n ${msg}'); window.location.replace('${config.frontServer}/storeList') </script></html>`
          })
    }

    @Post('resultNicePay') 
    async getResultNicePay(@Req() req: Request, @Res() res: Response, @Body() bodyData: any){
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        console.log('resultNicepay:::::::::::');
        console.log(bodyData);
        const now = common.getYYYYMMDDHHMMSS();
        let envalue =  bodyData.AuthToken + config.MID + bodyData.Amt + now +config.MKEY;
        let encrypt = common.getSignData(envalue);
       
        let body = null;
        let requestBody = {
            signData: encrypt,
            //TID: bodyData.TxTid,
            AuthToken: bodyData.AuthToken,
            MID: bodyData.MID,
            Amt: bodyData.Amt,
            EdiDate: now,
            SignData: encrypt,
            Moid: bodyData.Moid,
            CharSet: 'utf-8'
        }

        let cancelBody = {
            ...requestBody,
            ...{CancelAmt: bodyData.Amt, PartialCancelCode: 0, orderId: bodyData.Moid, CancelMsg:'통신 실패 에러' }
        }
        if(bodyData.AuthResultCode == '0000') {
            
            try{
                const result = await nicepayApproval(bodyData.NextAppURL, requestBody, res);
                if (result.status !== 200) {
                   return this.validationError('결제 요청을 실패했습니다. (2001)', res, cancelBody);
                  }
                //var Signature = JSON.parse(strContents).Signature.toString()
                switch (result.data.payMethod) {
                    case 'CARD':
                        if (result.data.ResultCode !== '3001') {
                        return this.validationError(result.data.ResultMsg, res, cancelBody);
                        }
                        break;
                    case 'BANK':
                        if (result.data.ResultCode !== '4000') {
                        return this.validationError(result.data.ResultMsg, res, cancelBody);
                        }
                        break;
                    case 'CELLPHONE':
                        if (result.data.ResultCode !== 'A000') {
                            return this.validationError(result.data.ResultMsg, res, cancelBody);
                        }
                        break;
                    case 'VBANK':
                        if (result.data.ResultCode !== '4100') {
                            return this.validationError(result.data.ResultMsg, res, cancelBody);
                        }
                        break;
                    case 'SSG_BANK':
                        if (result.data.ResultCode !== '0000') {
                            return this.validationError(result.data.ResultMsg, res, cancelBody);
                        }
                        break;
                    case 'CMS_BANK':
                        if (result.data.ResultCode !== '0000') {
                            return this.validationError(result.data.ResultMsg, res, cancelBody);
                        }
                        break;
                    }
                    const paySignature = common.getSignData(`${result.data.TID}${result.data.MID}${result.data.Amt}${config.MKEY}`).toString();
                    if (result.data.Signature !== paySignature) {
                        return this.validationError('결제 요청을 실패했습니다. (2002)', res, cancelBody);
                    }
                    if (result.data.payMethod === 'VBANK') {
                    } else {
                        //결제상태 
                        //payment_order_with_pg //kis server
                        const orderWithPg = this.paymentService.orderWithPg(result.data);
                        //실패인경우
                        if(!orderWithPg) {
                            cancelBody = {...cancelBody,...{CancelMsg:'스마트 오더 에러'}}
                            return this.validationError(result.data.ResultMsg, res, cancelBody);
                        }
                        this.paymentService.authUpdate(bodyData);
                        this.paymentService.updateOrderStatus( bodyData.Moid, '1001');
                    }
                    return res.send({
                        body: `<html><script>alert('주문이 완료되었습니다.\n주문 상세화면으로 이동합니다.'); window.location.replace('${config.frontServer}/storeList') </script></html>`
                    })
                    
            } catch (error) {
                return this.validationError('결제 요청을 실패했습니다. (2002)', res, cancelBody);
            }

        } else {
            this.validationError('결제 요청을 실패했습니다. (error)', res, cancelBody);
        }
    }


}
