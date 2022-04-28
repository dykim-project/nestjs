import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { logger } from 'src/config/winston';
import { Basket } from 'src/entity/basket.entity';
import { ProcessException } from 'src/exception/process.exception';

export class AuthResultDto {

}

@Injectable()
export class PaymentService {
    //ajax_order_regist.php 참고
    
    //'regist_cart'로 주문서 등록 & 주문TB저장
    async registCart() {
        try {
        //phpsorce - regist_cart 주문서 등록 
        //$regist_result = regist_cart($uid, $store_id);
        //3.주문서 등록 실패시 
        //if ($regist_result['rst'] == 0) {
            //throw new ServiceUnavailableException(error, 'REGIST_CART_FAIL');
        //} else {
            //주문 TB 저장
        
        } catch (error) {
            logger.error('[payment.registCart]');
            logger.error(error);
            //front - 장바구니 등록에 실패했습니다
            throw new InternalServerErrorException(error, 'REGIST_CART_FAIL');
        }
    }

    //주문상세tb insert & 주문tb update
    async orderDetailSave(basket: Basket[]) {
        try {
            let totalPrice = 0;
            let totalCnt = 0;
            basket.forEach(data => {
                //주문상세 tb insert
                //총금액 & 총갯수 count 
            });
            //주문tb 상품 총가격 & 갯수 update
        } catch(error) {
            logger.error('[payment.orderDetailSave]');
            logger.error(error);
            //front - 주문서 등록중 오류가 발생했습니다
            throw new InternalServerErrorException(error, 'REGIST_ORDER_BILL_FAIL');
        }
    }

    //주문 등록 phpsource - regist_order로 주문등록
    async registOrder() {
        try {

        } catch(error) {
            logger.error('[payment.registOrder]');
            logger.error(error);
            //front- 주문 등록중 오류가 발생했습니다
            throw new InternalServerErrorException(error, 'REGIST_ORDER_FAIL');
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
            throw new InternalServerErrorException('PAYMENT_FAIL');
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
