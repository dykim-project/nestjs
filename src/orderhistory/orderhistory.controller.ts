import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { OrderhistoryService } from './orderhistory.service';

@Controller('orderhistory')
export class OrderhistoryController {
    constructor(private readonly orderHistoryService: OrderhistoryService,
        ) {}
        //주문 목록 order_history.php
        @Get('order/history')
        async orderList(@Query('uid', ParseIntPipe) uid: number) { 
            //주문목록 조회 
            //get_order_list 외부 api
            await this.orderHistoryService.getOrderList(uid);
            //주문 상태 조회 
            //$sql = "select * from ks_order where order_id='$order_id'";
        }
    
        //주문상세 order_detail.php
        async orderDetail() {
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
        }
    
        //주문 취소 ajax_order_cancel.php
        async orderCancel() {
    
        }
    
}
