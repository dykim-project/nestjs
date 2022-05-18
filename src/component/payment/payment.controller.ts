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
import { logger } from 'src/config/winston';
import { InjectConnection } from '@nestjs/sequelize';
import { NcpayService } from '../ncpay/ncpay.service';
import { NcpayDto } from 'src/dto/ncPayDto';
const config = require('../../config/config');
const Sequelize = require('sequelize');

@Controller('payment')
export class PaymentController {
    constructor(
        @InjectConnection('accountdb')   
                private sequelize: typeof Sequelize,
                private readonly paymentService: PaymentService,
                private readonly cartService: CartService,
                private readonly storeService: StoreService,
                private readonly ncpayService: NcpayService) {}

    //장바구니에서 결제하기 클릭했을때 결제 process
    @Post()
    async payment(@Req() req: Request, @Res() res: Response, @Body() paymentDto: PaymentDto ){
        //최종 open 확인 
        try {
            console.log('paymentDto');
            console.log(paymentDto);
          
            if(paymentDto.payType === 'NCPAY') {
                const [payPwd] = await this.sequelize.query(`select payPwd from ncPay where id=${paymentDto.cardId}`,{ type: this.sequelize.QueryTypes.SELECT});
                const pwd = payPwd.payPwd;
                   // if (bcrypt.compareSync(paymentDto.pwd, pwd)) {
                //   //성공
                // }
                console.log(pwd);
                //틀리면 
            // return res.json({ststusCode:204, resultMsg: '카드 비밀번호가 맞지 않습니다.'});
            }
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
            //coupon code 있으면 
            await this.paymentService.pointAndCoupon(paymentDto, res);
            //2. 외부api regist_cart로 주문서 등록 
            await this.paymentService.registCart(paymentDto);
            //4.주문상세tb 저장 & 주문tb 총금액 update 
            await this.paymentService.orderDetailSave(basketInfo, paymentDto);
            //6. 외부 api regist_order로 주문서 접수 
            const result = await this.paymentService.registOrder(paymentDto);
            console.info('registorder');
            logger.info(result.success);
            //backand - goodsName, price, totalPRicd,userName, userEmail, usertel
            let goodName = basketInfo[0].prdNm + " " + paymentDto.sumProductQty + '개';
            if(basketInfo.length > 1) {
                goodName = basketInfo[0].prdNm + " 외 " + (paymentDto.goodsCount-1) + " 품목";
            }
            const now = common.getYYYYMMDDHHMMSS();
            let envalue =  now + config.MID + paymentDto.calAmt + config.MKEY;
            let encrypt = common.getSignData(envalue);
            let data = {userData: paymentDto,
                goodsName: goodName,
                totalPrice: paymentDto.totalPrice,
                ediDate: now,
                signData: encrypt,
                orderId: paymentDto.orderId,
                statusCode: 200
            }
            console.log('last paymentDto:::::::::::::::::');
            console.log(paymentDto);
            this.paymentService.updateOrder(paymentDto);
            //dbupdate 
            //ncpay로 결제 
           
            if(paymentDto.calAmt === 0 ){
                let data = this.payZero(paymentDto);
                res.json(data);
            } else if(paymentDto.payType === 'NCPAY') {
                let inputData:NcpayDto = {ncPayId: paymentDto.cardId,
                    orderId: paymentDto.orderId,
                    name: paymentDto.name,
                    email: paymentDto.email,
                    userTel: paymentDto.userTel,
                    GoodsName: goodName,
                    amt: paymentDto.calAmt,
                    uid: paymentDto.uid,
                    point: paymentDto.usedPoint,
                    couponIdx: paymentDto.userCouponIdx,
                    storeId: paymentDto.storeId}
                    const data = await this.ncpayService.payNcpay(inputData, res);
                    return res.json(data);
            } else {
                return res.json({statusCode: 200 , ...data});
            }
        } catch(error) {
            logger.info(error);
            return res.json({statusCode: 502 ,  resultMsg:'server error'});
        }
    }


    async validationError(msg, res) {
        console.log('validation Error');
        //fail update 
  
        return res.send({
        body: `<html><script>alert('결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다 \n ${msg}'); window.location.replace('${config.frontServer}/storeList') </script></html>`
        })
    }

    async payZero(paymentDto: PaymentDto) {
             //포인트 전체 사용으로 결제 금액이 없는경우
             if(paymentDto.calAmt === 0) {
                console.log('paymentDto.calAmt' + paymentDto.calAmt);
                let orderId = paymentDto.orderId;
                let inputAuth = {MID: 'point',
                    TID: 'point',
                    Amt: 0,
                    Moid: paymentDto.orderId,
                    CardName: 'point',
                    CardCode: 'point',
                    AuthCode: 'point'
                      };
                const orderWithPg = await this.paymentService.orderWithPg(inputAuth);
                await this.paymentService.authUpdate(inputAuth);
                await this.paymentService.updateOrderStatus(orderId, '1001');
                await this.cartService.deleteAllCart(paymentDto.uid);
                if(paymentDto.usedPoint > 0 ) {
                    let pointData = {orderId,
                                    point: paymentDto.usedPoint,
                                    uid: paymentDto.uid, 
                                    amt: paymentDto.calAmt};
                    this.paymentService.savePointHistory(pointData);
                } else if(paymentDto.couponDiscount > 0) {
                    this.paymentService.saveCouponHistory(paymentDto.userCouponIdx, paymentDto.orderId);
                }
                    let data = {statusCode: 200 , resultMsg:'ZERO_PAY'};
                    return data;
            }
    }

    @Post('resultNicePay') 
    async getResultNicePay(@Req() req: Request, @Res() res: Response, @Body() bodyData: any){
        console.log(bodyData);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
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
                logger.info('approval::::::::::::::::::::::::');
                logger.info(result.data);
                if (result.status !== 200) {
                   return this.validationError('결제 요청을 실패했습니다. (2001)', res);
                  }
                    const paySignature = common.getSignData(`${result.data.TID}${result.data.MID}${result.data.Amt}${config.MKEY}`).toString();
                    if (result.data.Signature !== paySignature) {
                        return this.validationError('결제 요청을 실패했습니다. (2002)', res);
                    }

                //스마트 오더 시작--------------------------------------
                logger.info('smartorder::::::::::::::::::::::');
                //스마트오더 주문 상태 변경 
                    const orderWithPg = await this.paymentService.orderWithPg(result.data);
                // //실패인경우 결제 취소 
                logger.info('orderWithPg:::::');
                logger.info(orderWithPg);
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
                        logger.info('cancelBody::::::::::::::::::::::::::::::');
                        logger.info(cancelBody);
                        const result =  await nicepayNetcancel(cancelBody);
                        //취소성공 
                        if(result.data.ResultCode === 2001) {
                            await this.paymentService.updateOrderStatus(cancelBody.orderId, 'EC9999');
                        }
                        return res.send({
                            body: `<html><script>alert('결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다 '); window.location.replace('${config.frontServer}/storeList') </script></html>`
                        })
                    } catch(error) {
                        logger.info('cancel error:::::::::::::::::::::::');
                        logger.info(error);
                        return res.send({
                            body: `<html><script>alert('결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다 '); window.location.replace('${config.frontServer}/storeList') </script></html>`
                        })
                    }
                } else {
                    let orderId = (bodyData.Moid).replace('F','');
                    await this.paymentService.authUpdate(result.data);
                    await this.paymentService.updateOrderStatus(orderId, '1001');
                    console.log('req reserved ' + (bodyData.ReqReserved));
                    try {
                    let resultArr = (bodyData.ReqReserved).split("|");
                    console.log(`delete cart uid::::: ${resultArr[0]}`);
                    await this.cartService.deleteAllCart(resultArr[0]);
                    //쿠폰이랑 포인트 사용으로 변경 
                    if(resultArr[1] > 0) {
                        this.paymentService.saveCouponHistory(resultArr[1], orderId);
                    }
                    if(resultArr[2] > 0) {
                        let pointData = {orderId,
                                        point: resultArr[2],
                                        uid: resultArr[0],
                                        amt: bodyData.Amt}
                        this.paymentService.savePointHistory(pointData);
                    }
                    //적립 
                    const savedPoint = Number(bodyData.Amt) * 0.01; //적립 포인트 
                    let pointData = {
                    uid: resultArr[0],
                    orderId: orderId,
                    point: savedPoint
                    };
        this.paymentService.savePointHistory(pointData);
                } catch(error) { 
                    logger.error('update coupon point');
                    logger.error(error);
                }
                    return res.send({
                        body: `<html><script>window.location.replace('${config.frontServer}/complete') </script></html>`
                    })
                }
                    
            } catch (error) {
                return this.validationError('결제 요청을 실패했습니다. (2002)', res);
            }

        } else {
          
            this.validationError('결제 요청을 실패했습니다. (error)', res);
        }
    }
}
