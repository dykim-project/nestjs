import { BadRequestException, Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { Request } from 'express';
import { logger } from 'src/config/winston';
import { PaymentDto } from 'src/dto/paymentDto';
import { order } from 'src/entity/order.entity';
import { orderDetail } from 'src/entity/orderDetail.entity';
import { kisServerCon } from '../../utils/kis.server.connection';
import { common } from '../../utils/common';

export class AuthResultDto {

}

@Injectable()
export class PaymentService {
    constructor(
        @InjectModel(order)
        private orderModel: typeof order,
        
        @InjectModel(orderDetail)
        private orderDetailModel: typeof orderDetail
    ) {}
    //ajax_order_regist.php 참고
    
    //'regist_cart'로 주문서 등록 & 주문TB저장
    async registCart(paymentDto: PaymentDto): Promise<any> {
        try {
            //phpsorce - regist_cart 주문서 등록 
            const data = {chnlMbrId: paymentDto.uid, 
                            strId:paymentDto.storeId, 

                            ordrKindCdPrefix:'2'}; //ordrKindCdPrefix는 '2'를 고정으로 전달 한다.
        
            let result = await kisServerCon('/api/channel/nonpage/order/getSubmitInfo', data);
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
                osType: paymentDto.osType
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
            let totalPrice = 0;
            let totalCnt = 0;
            let goodsCount:number = 0;
            basket.forEach(async data => {
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
                totalCnt += Number(itemQty);
                totalPrice += (Number(itemQty) * Number(itemPrice));
            });
            //주문tb 상품 총가격 & 갯수 update
            const result = await this.orderModel.update(
                {totalPrice: totalPrice,
                    sumProductQty: totalCnt
                },
                {where : {orderId: paymentDto.orderId} }
            );
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

    //주문 등록 phpsource - regist_order로 주문등록
    async registOrder(paymentDto: PaymentDto) {
        //paymentDto.totalPrice ===0 이면 error 처리 
       
        const data = {chnlMbrId: paymentDto.uid,
                        strId: paymentDto.storeId,
                        ordrId: paymentDto.orderId,
                        payMthdCd: 'PC',
                        PayMethod: 'CARD',
                        pgCd: 'WL',
                        ordrKindCd:  '2ICP',//선불결제
                        payPrc: `${paymentDto.totalPrice}`, 
                        ordrPrc: `${paymentDto.totalPrice}`,
                        prePayCd: 'P',
                        postPaySelectVal:'',//미사용 & 필수값아니지만 없으면 오류 발생
                        orderCnct: paymentDto.userTel,
                        ordeCnct: paymentDto.userTel,
                        ordrDesc: '',
                        discPrc: 0 
                    };

                    
        let result = await kisServerCon('/api/channel/nonpage/order/insert', data);
        console.log('orderInsert::::::::::::::::');
        console.log(result)
        if(result.data.success) {
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
        // ResultCode: '3001',
        // ResultMsg: '카드 결제 성공',
        // Amt: '000000009000',
        // MID: 'nicepay00m',
        // Moid: '00000001492630',
        // BuyerEmail: 'yeg1511@naver.com',
        // BuyerTel: '11111111111',
        // BuyerName: '양일권',
        // GoodsName: '더치맥주 2개',
        // TID: 'nicepay00m01012205101857514862',
        // AuthCode: '03182126',
        // AuthDate: '220510185753',
        // PayMethod: 'CARD',
        // CartData: '',
        // Signature: '27d0ede6fca981b0f8a3e319ea803679611827f674a180de58ac159a1a30731a',
        // MallReserved: '',
        // CardCode: '04',
        // CardName: '삼성',
        // CardNo: '53664800****4472',
        // CardQuota: '00',
        // CardInterest: '0',
        // AcquCardCode: '04',
        // AcquCardName: '삼성',
        // CardCl: '0',
        // CcPartCl: '1',
        // CouponAmt: '000000000000',
        // CouponMinAmt: '000000000000',
        // PointAppAmt: '000000000000',
        // ClickpayCl: '',
        // MultiCl: '',
        // MultiCardAcquAmt: '',
        // MultiPointAmt: '',
        // MultiCouponAmt: '',
        // RcptType: '',
        // RcptTID: '',
        // RcptAuthCode: '',
        // CardType: '01'
        const result = await this.orderModel.update(
            {mid: authData.MID,
             tid: authData.TID,
             amt: authData.Amt,
             moid: authData.Moid,
             cardName: authData.CardName,
             cardCode: authData.CardCode,
             authCode: authData.AuthCode

            },
            {where : {orderId: authData.Moid} }
        );
    }



    //스마트 오더 진행..?  
    async orderWithPg(authResult: any) {
        try {
            //phpsorce - 'payment_order_with_pg'실행
            const data = {ordrId: authResult.Moid, 
                pgMID:authResult.MID, 
                pgTrId:authResult.TID,
                pgAuthNo: authResult.AuthCode,
                cardIssueCorpNo: authResult.CardCode,
                cardIssueCorpNm: authResult.CardName
            }; 

            let result = await kisServerCon('/api/channel/nonpage/extpg/approval', data);
            console.log('in orderWithPg:::::::::::::::');
            console.log(result.data);
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
        //$sql = "update ks_order set ".
        //"status= status".
        //"where order_id='".$orderId."'";
        const result = await this.orderModel.update(
            {
              status: status,
            },
            { where: { orderId: orderId } }
          );
        console.log(result);
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

    //결제 취소 cancelResult_utf.php
    async cancelPayment() {
        try{
            //cancelResult_utf.php참고  url 호출
            const result = await this.cancelAjax();
            //결과  $response['ResultCode'] != '2001' <-실패상태
            if (result.resultCode != '2001') {
                //front - 결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다
                logger.error(`[payment.cancelPayment] resultCode: ${result.resultCode}`);
                logger.error(result.resultMsg);
                throw new InternalServerErrorException('PAYMENT_FAIL');
            } else {
              //결제 취소 성공시 상태 변경
              await this.updateOrderStatus('', 'EC9999'); 
            }
        } catch(error) {
            //front - 결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다
            //'ResultCode' => '9999',
			//'ResultMsg' => '통신실패'
            logger.error(['payment.cancelPayment']);
            throw new InternalServerErrorException('PAYMENT_FAIL');
        }

    }

    async cancelAjax() {
        return {resultCode:'', resultMsg:''}
    }


    
}

