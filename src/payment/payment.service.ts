import { BadRequestException, Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { Request } from 'express';
import { throwError, timestamp } from 'rxjs';
import { logger } from 'src/config/winston';
import { PaymentDto } from 'src/dto/paymentDto';
import { Basket } from 'src/entity/basket.entity';
import { order } from 'src/entity/order.entity';
import { orderDetail } from 'src/entity/orderDetail.entity';
import { kisServerCon } from '../utils/kis.server.connection';
import { common } from '../utils/common';

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
                orderId: result.ordrId,//'order1010103',//서버에서 생성함 
                userSeq: 0,
                storeId: paymentDto.storeId,//'ST00101010',
                orderType: 0,//0, //0 픽업, 
                orderDate: date.getTime(),
                orderYmd: year + month + day,
                orderY: year, 
                orderM: month,
                orderD: day,
                orderW: this.getInputDayLabel(),
                //payType: '',
                //couponCategory
                //couponId
                addr:paymentDto.orderAddr , //$seat_area."|".$seat_name."|".$seat_num;
                tel: paymentDto.userTel,
                uid: paymentDto.uid, 
                user_id: paymentDto.userId,//'temp_Id',
                user_name: paymentDto.userName,// 'name',
                os_type: paymentDto.osType
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
            basket.forEach(async data => {
                //------------------------------------------------
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
                totalCnt += itemQty;
                totalPrice += (itemQty * itemPrice);
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
                        ordrKindCd: '2ICP',
                        payPrc: paymentDto.totalPrice, 
                        ordrPrc: paymentDto.totalPrice,
                        prePayCd: 'P',
                        postPaySelectVal:'',//미사용 & 필수값아니지만 없으면 오류 발생
                        ordrCnct: paymentDto.userTel,
                        ordrDesc: (paymentDto.customerReq).substring(0, 100),
                        discPrc: 0 
                    };
        let result = await kisServerCon('/api/channel/nonpage/order/insert', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            //front- 주문 등록중 오류가 발생했습니다
            common.logger(result.data, '[payment.registOrder]');
            common.errorException(502, 'REGIST_ORDER_FAIL', result.data);
        }
    }

    
    //nicepay 인증요청 payRequest_utf
    async nicepayAuth(): Promise<any> {
        try { 
            const url = '';
            const data = {
            a: 10,
            b: 20,
            };
            axios
            .post(url, data, {
                timeout: 15, 
                headers: {
                Accept: "application/json",
                
                },
            })
            .then(({data}) => {
                //성공
                //if($authResultCode === "0000"){
                    //리턴 파라미터들 
                   /* $authResultCode = $_POST['AuthResultCode'];		// 인증결과 : 0000(성공)
                    $authResultMsg = $_POST['AuthResultMsg'];		// 인증결과 메시지
                    $nextAppURL = $_POST['NextAppURL'];				// 승인 요청 URL
                    $tid = $_POST['TxTid'];						// 거래 ID
                    $authToken = $_POST['AuthToken'];				// 인증 TOKEN
                    $payMethod = $_POST['PayMethod'];				// 결제수단
                    $mid = $_POST['MID'];							// 상점 아이디
                    $moid = $_POST['Moid'];							// 상점 주문번호
                    $amt = $_POST['Amt'];							// 결제 금액
                    $orderId = $_POST['ReqReserved'];			// 주문ID
                    $netCancelURL = $_POST['NetCancelURL'];			// 망취소 요청 URL*/
                //} else {
                    //실패
                //}
            });
        } catch(error) { 
            logger.error('[payment.nicepayAuth]');
            logger.error(error);
            error.errorCode = 502;
            error.errorMessage = 'PAYMENT_FAIL';
            throw new InternalServerErrorException(error);
     }
    }    
    
    //결제 승인 요청
    async nicepayApproval(authResult: AuthResultDto): Promise<any> {
        try {

        } catch(error) {
            //실패시 망취소 
            await this.cancelNetwork();
            logger.error('[payment.nicepayApproval]');
            logger.error(error);
            throw new InternalServerErrorException('PAYMENT_FAIL');
        }
    }

    //결제정보 주문db update
    async orderDataUpdate(authResult: AuthResultDto) {

    }

    //스마트 오더 진행..?  
    async orderWithPg(authResult: AuthResultDto) {
        try {
            //phpsorce - 'payment_order_with_pg'실행
            //실패코드일때
            //if ($payment_result['rst'] == 0) {
                //결제 취소 진행
                this.cancelPayment();
            //}
            //성공일때
            //주문db 상태 update - ks_order status = 1001
            await this.updateOrderStatus('', '1001'); 
            //return success
        } catch(error) {
            //결제 취소 
            await this.cancelPayment();
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

    getUserAgent(req: Request) {
        let user_agent = req.header('User-Agent') //userAgent 값 얻기
        let os_type = "etc";
        if (user_agent.match('android') != null) { 
            os_type = "android";
        } else if (user_agent.indexOf("iphone") > -1 || user_agent.indexOf("ipad") > -1 || user_agent.indexOf("ipod") > -1) { 
            os_type = "ios";
        }
        return os_type;
    }


    getInputDayLabel() {
        var week = new Array(0,1,2,3,4,5,6);
        var today = new Date().getDay();
        var todayLabel = week[today];
        
        return todayLabel;
    }
    
    
}

