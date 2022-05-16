import { Controller, Get, ParseIntPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { StoreService } from '../store/store.service';
import { OrderhistoryService } from './orderhistory.service';
import { common } from '../../utils/common';
import { nicepayNetcancel } from 'src/utils/nicepay.netcancel';
const config = require('../../config/config');

@Controller('order')
export class OrderhistoryController {
    constructor(private readonly orderHistoryService: OrderhistoryService,
        private readonly storeService: StoreService
        ) {}
        //주문 목록 order_history.php
        @Get('list')
        async orderList(@Res() res:Response, @Query('uid') uid: number) { 
            //주문목록 조회 
            let ordrList = await this.orderHistoryService.getOrderList(uid);
            // 주문번호를 통해 디비에서 store_id 취득
            let result =  await Promise.all( ordrList.map(async (data) => {
                 console.log(data);
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
        }

    
        //주문상세 order_detail.php
        @Get('detail')
        async orderDetail(@Res() res:Response, @Query('uid') uid: number, @Query('orderId') ordrId: string) {
            //order정보 DB 조회
            let orderData = await this.orderHistoryService.getOrderData(ordrId);
           
            let storeDetail = await this.storeService.getStoreDetail(orderData.storeId);
            const orderKisData = await this.orderHistoryService.getOrderKisData(uid, ordrId);
            //orderDetail정보 db조회
            //const orderDetail = await this.orderHistoryService.getOrderDetail(ordrId);
            //매장이름, 매장상세정보, 매장 이미지; 
            //주문내역 조회(매장아이디, 주문금액, 결제 금액, 주문상태)
            //$sql = "select * from ks_order where order_id=%s";
                //$store_id = $order_row['store_id'];         // 매장아이디
                //$total_price = $order_row['total_price'];   // 주문 금액
                //$pay_price = $order_row['pay_price'];       // 결제 금액
                //$ks_status = $order_row['status'];       // 주문 상태
    
    
            //주문상세
            //get_order_detail 외부 api
    
    
    
            //주문내역상세
            //$sql = "select * from ks_order_detail where order_id=%s";
                //item_type
                //item_name
                //item_qty
                //item_price
            let body = {orderData,
                orderKisData,
                storeDetail,
               // orderDetail,
                statusCode: 200}
            res.json(body);
        }
    
        //주문 취소 ajax_order_cancel.php
        async orderCancel(ordrId) {
            try {
                const now = common.getYYYYMMDDHHMMSS();
                let {tid, mid, moid, amt} = await this.orderHistoryService.getOrderData(ordrId);
                let envalue = mid + amt + now +config.MKEY;
                let encrypt = common.getSignData(envalue);
                let cancelBody = {
                    TID: tid,
                    Moid: moid,
                    MID: mid,
                    CancelAmt: amt,
                    CancelMsg: '고객 취소',
                    PartialCancelCode: 0,
                    EdiDate: now,
                    SignData: encrypt,
                    CharSet:'utf-8'
                }
                const result = await nicepayNetcancel(cancelBody);
                return result;
            } catch (error) {
                //alert 취소중 오류 
            }
        }
    
}
