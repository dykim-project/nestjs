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
import { logger } from 'src/config/winston';
const config = require('../../config/config');

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
        const result = await this.paymentService.registOrder(paymentDto);
        console.info('registorder');
        logger.info(result);
        //backand - goodsName, price, totalPRicd,userName, userEmail, usertel
        let goodName = basketInfo[0].prdNm + " " + paymentDto.sumProductQty + '개';
        if(basketInfo.length > 1) {
            goodName = basketInfo[0].prdNm + " 외 " + (paymentDto.goodsCount-1) + " 품목";
        }
        const now = common.getYYYYMMDDHHMMSS();
        let envalue =  now + config.MID + paymentDto.totalPrice + config.MKEY;
        let encrypt = common.getSignData(envalue);
        let data = {userData: paymentDto,
            goodsName: goodName,
            totalPrice: paymentDto.totalPrice,
            ediDate: now,
            signData: encrypt,
            orderId: paymentDto.orderId,
            statusCode: 200
        }
        logger.info('make payment::::');
        return res.json({statusCode: 200 , ...data});
    }


    async validationError(msg, res) {
        console.log('validation Error');
        //fail update 
  
        return res.send({
        body: `<html><script>alert('결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다 \n ${msg}'); window.location.replace('${config.frontServer}/storeList') </script></html>`
        })
    }

    @Post('resultNicePay') 
    async getResultNicePay(@Req() req: Request, @Res() res: Response, @Body() bodyData: any){
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        console.log('resultNicepay:::::::::::');
        console.log('MID::::::::::::::::::::::::::' + config.MID);
        console.log(bodyData);
        const now = common.getYYYYMMDDHHMMSS();
        let envalue =  bodyData.AuthToken + config.MID + bodyData.Amt + now +config.MKEY;
        let encrypt = common.getSignData(envalue);
       
        let requestBody = {
            signData: encrypt,
            TID: bodyData.TxTid,
            AuthToken: bodyData.AuthToken,
            MID: bodyData.MID,
            Amt: bodyData.Amt,
            EdiDate: now,
            SignData: encrypt,
            Moid: bodyData.Moid,
            CharSet: 'utf-8',
            netCancelUrl: bodyData.NetCancelURL
        }

        if(bodyData.AuthResultCode == '0000') {
            
            try{
                const result = await nicepayApproval(bodyData.NextAppURL, requestBody, res);
                if (result.status !== 200) {
                   return this.validationError('결제 요청을 실패했습니다. (2001)', res);
                  }
                //var Signature = JSON.parse(strContents).Signature.toString()
                switch (result.data.payMethod) {
                    case 'CARD':
                        if (result.data.ResultCode !== '3001') {
                        return this.validationError(result.data.ResultMsg, res);
                        }
                        break;
                    case 'BANK':
                        if (result.data.ResultCode !== '4000') {
                        return this.validationError(result.data.ResultMsg, res);
                        }
                        break;
                    case 'CELLPHONE':
                        if (result.data.ResultCode !== 'A000') {
                            return this.validationError(result.data.ResultMsg, res);
                        }
                        break;
                    case 'VBANK':
                        if (result.data.ResultCode !== '4100') {
                            return this.validationError(result.data.ResultMsg, res);
                        }
                        break;
                    case 'SSG_BANK':
                        if (result.data.ResultCode !== '0000') {
                            return this.validationError(result.data.ResultMsg, res);
                        }
                        break;
                    case 'CMS_BANK':
                        if (result.data.ResultCode !== '0000') {
                            return this.validationError(result.data.ResultMsg, res);
                        }
                        break;
                    }
                    const paySignature = common.getSignData(`${result.data.TID}${result.data.MID}${result.data.Amt}${config.MKEY}`).toString();
                    if (result.data.Signature !== paySignature) {
                        return this.validationError('결제 요청을 실패했습니다. (2002)', res);
                    }
                    if (result.data.payMethod === 'VBANK') {
                    } else {
                        //스마트오더 주문 상태 변경 
                         const orderWithPg = await this.paymentService.orderWithPg(result.data);
                        // //실패인경우 결제 취소 
                        console.log('orderWithPg:::::');
                        console.log(orderWithPg);
                        // orderWithPg.rst == 0
                        if(!orderWithPg ) {
                            try{
                                let nowTime = common.getYYYYMMDDHHMMSS();
                                let envalue = config.MID + bodyData.Amt + nowTime +config.MKEY;
                                let encrypt = common.getSignData(envalue);
                                let cancelBody = {
                                    ...requestBody,
                                    ...{SignData: encrypt ,CancelAmt: bodyData.Amt, PartialCancelCode: 0, orderId: bodyData.Moid, CancelMsg:'통신 실패 에러' }
                                }
                            console.log('cancelBody::::::::::::::::::::::::::::::');
                            const result =  await nicepayNetcancel(cancelBody);
                            //취소성공 
                            if(result.data.ResultCode === 2001) {
                                await this.paymentService.updateOrderStatus(cancelBody.orderId, 'EC9999');
                            }
                            return res.send({
                                body: `<html><script>alert('결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다 '); window.location.replace('${config.frontServer}/storeList') </script></html>`
                            })
                            } catch(error) {
                                console.log('cancel error:::::::::::::::::::::::');
                                console.log(error);
                                return res.send({
                                    body: `<html><script>alert('결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다 '); window.location.replace('${config.frontServer}/storeList') </script></html>`
                                })
                            }
                        } else {
                            //완료후 장바구니 지우기 ??
                            this.paymentService.authUpdate(result.data);
                            this.paymentService.updateOrderStatus( bodyData.Moid, '1001');
                        }
                    }
                    return res.send({
                        body: `<html><script>alert('주문이 완료되었습니다.\n주문 상세화면으로 이동합니다.'); window.location.replace('${config.frontServer}/storeList') </script></html>`
                    })
                    
            } catch (error) {
                return this.validationError('결제 요청을 실패했습니다. (2002)', res);
            }

        } else {
          
            this.validationError('결제 요청을 실패했습니다. (error)', res);
        }
    }


}
