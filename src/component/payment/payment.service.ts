import { BadRequestException, ConsoleLogger, Injectable, InternalServerErrorException, Res, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { Request, Response } from 'express';
import { logger } from 'src/config/winston';
import { PaymentDto } from 'src/dto/paymentDto';
import { order } from 'src/entity/order.entity';
import { orderDetail } from 'src/entity/orderDetail.entity';
import { kisServerCon } from '../../utils/kis.server.connection';
import { common } from '../../utils/common';
const Sequelize = require('sequelize');

@Injectable()
export class PaymentService {
    constructor(
        @InjectModel(order)
        private orderModel: typeof order,
        
        @InjectModel(orderDetail)
        private orderDetailModel: typeof orderDetail,

        @InjectConnection('accountdb')
        private sequelize: typeof Sequelize,

        @InjectConnection()
        private sequelizeMd: typeof Sequelize,
    ) {}
    //ajax_order_regist.php 참고
    
    //'regist_cart'로 주문서 등록 & 주문TB저장
    async registCart(paymentDto: PaymentDto): Promise<any> {
        try {
            //phpsorce - regist_cart 주문서 등록 
            const data = {chnlMbrId: paymentDto.uid, 
                            strId:paymentDto.storeId, 
                            ordrId:paymentDto.orderId,
                            ordrKindCd:'9ICP', //배달
                            payPrc: `${paymentDto.totalPrice}`,
                            totalOrder: `${paymentDto.totalPrice}`,
                            PayMethod: 'CARD',
                            pgCd: 'WL',
                            prePayCd: 'P',
                            postPaySelectVal:'',
                            ordrKindCdPrefix:'2'}; //ordrKindCdPrefix는 '2'를 고정으로 전달 한다.
        
            let result = await kisServerCon('/api/channel/nonpage/order/getSubmitInfo', data);
            console.log('registCart::::');
            console.log(result);
            if(result.data.success) {
                result = result.data.data;
            } else {
                common.logger(result.data, '[payment.registCart kis-server]');
                common.errorException(502, 'REGIST_CART_FAIL', result.data);
            }
            const date = new Date();
            const year:string = date.getFullYear().toString();
            const month:string = ("0" + (date.getMonth() + 1)).slice(-2);
            const day:string = ("0" + date.getDate()).slice(-2);
            //주문 TB 저장
            const saveData = {
                orderId: result.ordrId,//서버에서 생성함 
                userSeq: 0,
                storeId: paymentDto.storeId,
                orderType: 0,//0, //0 픽업, 
                orderDate: date.getTime(),
                orderYmd: year + month + day,
                orderY: year, 
                orderM: month,
                orderD: day,
                orderW: common.getInputDayLabel(),
                //payType: '',
                //couponCategory
                //couponId

                addr:paymentDto.orderAddr , //$seat_area."|".$seat_name."|".$seat_num;
                tel: paymentDto.userTel,
                uid: paymentDto.uid, 
                userId: paymentDto.userId,//'temp_Id',
                userName: paymentDto.name,// 'name',
                osType: paymentDto.osType,
                payType:paymentDto.payType
            }
            const insertResult = await this.orderModel.create(saveData);
            paymentDto.orderId = result.ordrId;
            return paymentDto;
        } catch (error) {
            common.logger(error, '[payment.registCart]');
            //front - 장바구니 등록에 실패했습니다
            common.errorException(502, 'REGIST_CART_FAIL', error);
        }
    }

    //주문상세tb insert & 주문tb update
    async orderDetailSave(basket: any[], paymentDto: PaymentDto) {
        try {
            let totalPrice:number = 0;
            let totalCnt:number = 0;
            let goodsCount:number = 0;
            await basket.forEach(async data => {
                let itemId = "";
                let itemName = "";
                let itemQty = 0;
                let itemPrice = 0;
                let itemType = data.prdOptCd;
                if (itemType == "S") { // 메인상품
                    itemId = data.upPrdId;
                    itemName = data.prdNm;
                    itemQty = data.ordrCnt;
                    itemPrice = data.salePrc;
                    goodsCount +=1;
                } else { // 옵션상품
                    itemId = data.prdId;
                    itemName = `${data.prdOptNm} > ${data.prdNm}`;
                    itemQty = data.ordrCnt;
                    itemPrice = data.optPrc;
                }
                //----------------------------------------------------
             
                //주문상세 tb insert
                let date = new Date();
                let inputData = {
                    orderId:paymentDto.orderId,
                    userSeq: 0,
                    storeId:paymentDto.storeId,
                    itemId: itemId,
                    itemType: data.prdOptCd, 
                    itemName: itemName,
                    itemPrice: itemPrice,
                    itemQty: itemQty,
                    basketId: data.baskId,
                    basketIdDetail: data.baskDtlId, 
                    regDate: date.getTime()
                }
                await this.orderDetailModel.create(inputData);
                //총금액 & 총갯수 count 
                console.log('totalCnt::::');
                console.log(Number(itemQty));
                totalCnt += Number(itemQty);
                console.log(totalCnt);
                totalPrice += (Number(itemQty) * Number(itemPrice));
            });
            await this.updateOrder(paymentDto);
            paymentDto.totalPrice = totalPrice;
            paymentDto.sumProductQty =  totalCnt;
            paymentDto.goodsCount = goodsCount;
            return paymentDto;
        } catch(error) {
            common.logger(error, '[payment.orderDetailSave]');
            //front - 주문서 등록중 오류가 발생했습니다
            common.errorException(502, 'REGIST_ORDER_BILL_FAIL', error);
        }
    }

    async updateOrder(paymentDto: PaymentDto) {
          //주문tb 상품 총가격 & 갯수 update
          const result = await this.orderModel.update(
            {totalPrice: paymentDto.totalPrice,
                sumProductQty: paymentDto.sumProductQty,
                couponId: paymentDto.userCouponIdx,
                couponTitle: paymentDto.couponName,
                payPrice: paymentDto.calAmt,
                discountPrice:paymentDto.discountAmt,
                pointPrice: paymentDto.usedPoint
            },
            {where : {orderId: paymentDto.orderId} }
        );
    }

    //주문 등록 phpsource - regist_order로 주문등록
    async registOrder(paymentDto: PaymentDto) {
        //paymentDto.totalPrice ===0 이면 error 처리 
       
        const data = {chnlMbrId: paymentDto.uid,
                        strId: paymentDto.storeId,
                        ordrId: paymentDto.orderId,
                        payMthdCd: 'PC',
                        PayMethod: 'CARD',
                        pgCd: 'WL',
                        ordrKindCd:  '9ICP',//배달 ",9ICP배달즉시,9RVP배달예약"
                        payPrc: `${paymentDto.calAmt}`, 
                        ordrPrc: `${paymentDto.calAmt}`,
                        prePayCd: 'P',
                        postPaySelectVal:'',//미사용 & 필수값아니지만 없으면 오류 발생
                        orderCnct: paymentDto.userTel,
                        ordeCnct: paymentDto.userTel,
                        ordrDesc: '',
                        discPrc: 0 
                    };

        let result = await kisServerCon('/api/channel/nonpage/order/insert', data);
        console.log('orderInsert::::::::::::::::');
        console.log(result.data)
        if(result && result.data.success) {
            result = result.data.data;
        } else {
            //front- 주문 등록중 오류가 발생했습니다
            common.logger(result.data, '[payment.registOrder]');
            common.errorException(502, 'REGIST_ORDER_FAIL', result.data);
        }
        return result;
    }

    //결제 결과 업데이트
    async authUpdate(authData) {
        logger.info('authupdate::::::::::::');
        logger.info(authData);
        let orderId = authData.orderId ?authData.orderId : authData.Moid.replace('F','');
        logger.info('orderId :::' + orderId);
        const result = await this.orderModel.update(
            {mid: authData.MID,
             tid: authData.TID,
             amt: authData.Amt,
             moid: authData.Moid,
             cardName: authData.CardName,
             cardCode: authData.CardCode,
             authCode: authData.AuthCode

            },
            {where : {orderId: orderId} }
        );
    }


    //스마트 오더 진행 
    async orderWithPg(authResult: any) {
        try {
            //phpsorce - 'payment_order_with_pg'실행
            const data = {ordrId: (authResult.Moid).replace('F', ''), 
                pgMID:authResult.MID, 
                pgTrId:authResult.TID,
                pgAuthNo: authResult.AuthCode,
                cardIssueCorpNo: authResult.CardCode,
                cardIssueCorpNm: authResult.CardName
            }; 
            console.log('order with pg data:::::::');
            console.log(data);
            let result = await kisServerCon('/api/channel/nonpage/extpg/approval', data);
            logger.info('in orderWithPg:::::::::::::::');
            logger.info(result.data);
            if(result.data.success) {
                if(result.data.rst === 0) {
                    return false;
                }
            } else {
                return false;
            }
            //주문db 상태 update - ks_order status = 1001
            await this.updateOrderStatus(authResult.Moid, '1001'); 
            return true;
            //return success
        } catch(error) {
            //결제 취소 
           return false;
        }
    }

    //결제상태 업데이트
    async updateOrderStatus(orderId: string, status: string) {
        const result = await this.orderModel.update(
            {
              status: status,
            },
            { where: { orderId: orderId.replace('F','') } }
          );
    }

    //망취소
    async cancelNetwork(): Promise<any> {
        try {

        } catch(error) {
            logger.error('[payment.cancelNetwork error]');
            logger.error(error);
            throw new InternalServerErrorException('PAYMENT_FAIL');
        }
    }

    async pointAndCoupon(paymentDto: PaymentDto, @Res() res: Response) {
          if (paymentDto.usedPoint > 0 && paymentDto.userCouponIdx > 0) {
            return res.json({statusCode:204, resultMsg: '포인트와 쿠폰을 함께 사용할 수 없습니다.'});
        }
        if ((paymentDto.usedPoint > 0 && paymentDto.usedPoint < 1000) || paymentDto.usedPoint % 100 > 0) {
          return res.json({statusCode:204, resultMsg: '포인트 사용은 최소 1000P 이상, 100P 단위로 사용이 가능합니다.'})
        }

        let couponDiscount = 0;
        let couponIdx;
        if (paymentDto.userCouponIdx > 0) {
            const [coupon] = await this.sequelize.query(`SELECT userCoupon.couponIdx, 
            coupon.discountType, coupon.discountAmount, coupon.maxDiscount,
            coupon.couponName
             FROM userCoupon JOIN coupon ON userCoupon.couponIdx=coupon.idx  WHERE userCoupon.idx=${paymentDto.userCouponIdx} AND userCoupon.isUsed='N'`,
             { type: this.sequelize.QueryTypes.SELECT});
  
       if (coupon.length === 0) {
            return res.json({statusCode:204, resultMsg: '잘못된 접근입니다.'});
       }
  
        couponIdx = coupon.couponIdx;
  
        if (coupon.discountType === 1) {
            couponDiscount = paymentDto.totalPrice * Number(coupon.discountAmount) / 100;
        if (coupon.maxDiscount) {
           couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
         }
       } else {
         couponDiscount = coupon.discountAmount;
         
       }
       if(paymentDto.totalPrice <couponDiscount ) {
           couponDiscount = paymentDto.totalPrice;
       }
       paymentDto.couponDiscount = couponDiscount;
       paymentDto.couponName = coupon.couponName;
     }   
     return couponDiscount;
    }

    //쿠폰 히스토리저장, 사용처리  
    async saveCouponHistory(userCouponIdx: number, orderId: string) {
        try {
            const [userCoupon] = await this.sequelize.query(`SELECT userIdx, couponIdx, coupon.couponName, coupon.discountType, coupon.maxDiscount
                FROM userCoupon join coupon  on userCoupon.couponIdx = coupon.idx WHERE  userCoupon.idx=${userCouponIdx}`,
                { type: this.sequelize.QueryTypes.SELECT});


            await this.sequelize.query(`INSERT INTO userCouponHistory
                                    (userIdx, couponIdx, userCouponIdx, shopCode, products, remark, regDatetime)
                                    VALUES(${userCoupon.userIdx}, ${userCoupon.couponIdx}, ${userCouponIdx}, '', '${orderId}', '스마트오더 쿠폰 사용[주문번호:${orderId}]', CURRENT_TIMESTAMP);`,
                                    { type: this.sequelize.QueryTypes.INSERT});
            await this.sequelize.query(`UPDATE userCoupon set isUsed='Y' WHERE  idx=${userCouponIdx}`,
            { type: this.sequelize.QueryTypes.UPDATE}); 

            return true;
        } catch (error) { 
            logger.error('saveCouponHistory');
            logger.error(error);
            return false;
        }
    }

    //포인트 차감 히스토리 저장 
    async savePointHistory(pointData:{
        orderId: string,
        point: number,
        uid: number
    }) {
        try {
        console.log('pointDara:::');
        console.log(pointData);
        const insertResult = await this.sequelize.query(`INSERT INTO userPointHistory
        (userIdx, pointKind, pointRef, description, point, regDatetime, expireYear, remark, isCanceled, shopCode)
        VALUES(${pointData.uid}, '1001', '', '스마트오더 포인트 사용[주문번호:${pointData.orderId}]', -${pointData.point}, CURRENT_TIMESTAMP, 0, '포인트 사용', 0, '');`);
        const update =  await this.sequelize.query(`UPDATE user set point=point-${pointData.point} WHERE  idx=${pointData.uid}`,
        { type: this.sequelize.QueryTypes.UPDATE}); 
            return true;
        } catch(error) {
            logger.error('savePointHistory');
            logger.error(error);
            return false;
        }
    }

}

