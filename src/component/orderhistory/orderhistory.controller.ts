import { Controller, Get, ParseIntPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { StoreService } from '../store/store.service';
import { OrderhistoryService } from './orderhistory.service';
import { common } from '../../utils/common';
import { nicepayNetcancel } from 'src/utils/nicepay.netcancel';
import { logger } from 'src/config/winston';
const config = require('../../config/config');

@Controller('order')
export class OrderhistoryController {
    constructor(private readonly orderHistoryService: OrderhistoryService,
        private readonly storeService: StoreService
        ) {}
        //주문 목록 order_history.php
        @Get('list')
        async orderList(@Res() res:Response, @Query('uid') uid: number) { 
            try{
                //주문목록 조회 
                let ordrList = await this.orderHistoryService.getOrderList(uid);
                // 주문번호를 통해 디비에서 store_id 취득
                let result =  await Promise.all( ordrList.map(async (data) => {
                    //가게 상세정보 조회하기 
                    let storeDetail = await this.storeService.getStoreDetail(data.strId);
                    //상세 주문 정보 검색
                    let orderDetailList = await this.orderHistoryService.getOrderDetail(data.ordrId);
                    //목록에 가게정보 추가
                    data = {...data, storeDetail, orderDetailList}
                    return  data;
                }));
                let body = {ordrList: result,
                            statusCode:200}
                return res.json(body);
            } catch(error) {
                console.log(error);
                logger.error('order/list exception');
                res.json({statusCode: 500, statusMsg:'server error'})
            }
        }

    
        //주문상세 order_detail.php
        @Get('detail')
        async orderDetail(@Res() res:Response, @Query('uid') uid: number, @Query('orderId') ordrId: string) {
            try {
                //order정보 DB 조회
                let orderData = await this.orderHistoryService.getOrderData(ordrId);
            
                let storeDetail = await this.storeService.getStoreDetail(orderData.storeId);
                const orderKisData = await this.orderHistoryService.getOrderKisData(uid, ordrId);
                let body = {orderData,
                    orderKisData,
                    storeDetail,
                // orderDetail,
                    statusCode: 200}
                res.json(body);
            } catch (error) {
                console.log(error);
                logger.error('order/detail exception');
                res.json({statusCode: 500, statusMsg:'server error'})
            }
        }
    
        @Get('/cancel')
        async Canceltest(@Res() res:Response, @Query('orderId') ordrId: string) {
            try {
            console.log('cancel');
            this.orderHistoryService.orderCancel(ordrId);
            } catch (error) {
                console.log(error);
                logger.error('order/detail exception');
                res.json({statusCode: 500, statusMsg:'server error'})
            }
        }




        async orderCancel(@Res() res:Response, @Query('uid') uid: number, @Query('orderId') ordrId: string) {
            try {
                const now = common.getYYYYMMDDHHMMSS();
                let {tid, mid, moid, amt, payType, payPrice} = await this.orderHistoryService.getOrderData(ordrId);
                let envalue = mid + payPrice + now +config.MKEY;
                    let encrypt = common.getSignData(envalue);
                let cancelBody = {
                        TID: tid,
                        Moid: moid,
                        MID: mid,
                        CancelAmt: payPrice,
                        CancelMsg: '고객 취소',
                        PartialCancelCode: 0,
                        EdiDate: now,
                        SignData: encrypt,
                        CharSet:'utf-8'
                    }
                console.log('nicecancel:::::::::');
                const ksSrCancel = await this.orderHistoryService.orderCancel(ordrId);
                const result = await nicepayNetcancel(cancelBody);
               // console.log(result);
               res.json({statusCode: 200, statusMsg:'success'});
            } catch (error) {
                //alert 취소중 오류 
            }
        }
    
}
