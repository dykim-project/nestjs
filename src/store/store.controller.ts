import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Res, ServiceUnavailableException } from '@nestjs/common';
import { Response } from 'express';
import { CartService } from 'src/cart/cart.service';
import { OrderHistoryService } from './orderhistory.service';
import { ProductService } from './product.service';
import { StoreService } from './store.service';

@Controller()
export class StoreController {
    constructor(private readonly storeService: StoreService,
                private readonly productService: ProductService,
                private readonly cartService: CartService,
                private readonly orderHistoryService: OrderHistoryService) {}
    
    //매장 목록
    @Get('store/list')
    async getStoreList(@Res() res:Response) {
      return res.json(await this.storeService.getStoreList());
    }

    //매장 상세(상품 목록)
    //http://localhost:3000/store/detail?uid=111&storeId=ST00005937
    @Get('store/detail')
    async getStoreDetail(@Res() res: Response,
                        @Query('uid') uid: number,
                        @Query('storeId') storeId: string): Promise<any> {

        //1.장바구니 정보 가져와서 같은 가게가 아니면 장바구니 삭제 
        const cartList = await this.cartService.getCartList(uid);
        //장바구니 전체 삭제
        await this.cartService.deleteAllCart(uid);
        //장바구니 정보 상세(장바구니 상단 표기 숫자)
        const cartCnt = this.cartService.getCartTotalCnt(cartList);
        
        //매장상세 정보(상단 매장정보)
        //get_store_info($store_id); //외부 api 사용 ST00005937
        const storeDetail = await this.storeService.getStoreDetail(storeId);

        //카테고리 목록
        const categoryList = await this.productService.getCategoryList(storeId);
        
        //상품 목록
        //get_item_list //외부 api 사용
        const productList = await this.productService.getProductList(storeId);
        //매장 운영 정보(개발전)
        const storeOpenChk = await this.storeService.getStoreOpenChk(storeId, storeDetail);
        let body = {
            cartCnt,
            storeDetail,
            productList,
            storeOpenChk,
            statusCode: 200
        }
        return res.json(body);
    }

    //상품 상세
    @Get('product/detail')
    async getProductDetail(@Res() res:Response, 
                        @Query('storeId') storeId: string,
                        @Query('itemId') itemId: string) {
        //매장 운영 확인
        const storeOpenChk = await this.storeService.getStoreOpenChk(storeId);
        
        //아이템 상세정보 조회 test 필요
        const productDetail = await this.productService.getProductDetail(storeId, itemId);                           
        let body = {
            storeOpenChk,
            productDetail,
            statusCode: 200
        }
        return res.json(body);        
    } 

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
