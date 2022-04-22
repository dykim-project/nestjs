import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { logger } from 'src/config/winston';
@Injectable()
export class PaymentService {

    async payment() {
        this.saveOrder();
        const auth = await this.nicepayAuth();
        if(auth) {
            const approval = await this.nicepayApproval();
            if(approval) {
                //결제정보 db update 
                this.saveOrder();
                //스마트 오더 진행<- ? 
                
            }
        }

        //return 500 인경우 front에서 결제 오류 alert 
    }
    //주문, 주문 상세 db 저장
    async saveOrder() {

    }

    //결제정보 주문테이블에 업데이트
    async updateOrder() {

    }

    //nicepay 인증요청
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
                console.log(data);
            });
        } catch(error) { 
            logger.error('[payment.nicepayAuth error]');
            logger.error(error);
            throw new InternalServerErrorException('[payment.nicepayAuth]');
     }
    }    
    
    //결제 승인 요청
    async nicepayApproval(): Promise<any> {
        try {

        } catch(error) {
            //망취소 
            await this.cancelNetwork();
            throw new InternalServerErrorException('[payment.nicepayApproval error]');
        }
    }



    //스마트 오더 진행..?  
    async orderWithPg() {
        try {
        //payment_order_with_pg
        //실패코드일때
            //결제취소 & 결제취소 결과 update //catch내용과 같음. 
        //성공일때
            //주문db 상태 update - ks_order status = 1001
        await this.updateOrderStatus('', '1001'); 
        } catch(error) {
            //결제 취소 
            const response = await this.cancelPayment();
            
            //취소 성공인경우 
            // - 주문db상태 update - ks_order status='EC9999'
            await this.updateOrderStatus('', 'EC9999'); 
            //취소 실패일때 front
            //logger.error('[orderWithPg]' + ResultMsg);
            //503인경우 front에서는 그대로 보여주기 
            throw new ServiceUnavailableException('ResultMsg');
            // - alertFail($response['ResultCode'], $response['ResultMsg']); 
        }
    }

    async updateOrderStatus(orderId: string, status: string) {

    }

    //망취소
    async cancelNetwork(): Promise<any> {
        try {

        } catch(error) {
            logger.error('[payment.cancelNetwork error]');
            logger.error(error);
            throw new InternalServerErrorException('[payment.cancelNetwork error]');
        }
    }

    //결제 취소
    async cancelPayment() {
        try{

        } catch(error) {
            //결제 취소중 오류일때 front에서 결제 취소중 오류 alert 만 띄움 
        }

    }
}
