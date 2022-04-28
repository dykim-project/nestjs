import { Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Query, Res, ServiceUnavailableException } from '@nestjs/common';
import { Response } from 'express';
import { CommonDto } from 'src/dto/commonDto';
import { ProductDto } from 'src/dto/productDto';
import { ProductService } from './product.service';
import { StoreService } from './store.service';

@Controller()
export class SmartorderController {
    constructor(private readonly storeService: StoreService,
                private readonly productService: ProductService) {}
    
    //매장 목록
    @Get('store/list')
    getStoreList() {
      return this.storeService.getStoreList();
    }

    //매장 상세(상품 목록)
    @Get('store/detail')
    async getStoreDetail(@Res() res: Response,
                        @Query('uid') uid: string,
                        @Query('storeId') storeId: string): Promise<any> {

        //1.장바구니 정보 가져와서 같은 가게가 아니면 장바구니 삭제 
        //delete_all_cart //외부 api호출하여 삭제

        //장바구니 정보 상세(장바구니 상단 표기 숫자)
        //get_basket_info //외부api 사용
        
        //매장상세 정보(상단 매장정보)
        //get_store_info($store_id); //외부 api 사용 
        const storeDetail = await this.storeService.getStoreDetail(storeId);
        //상품 목록
        //get_item_list //외부 api 사용
        const productList = await this.productService.getProductList(storeId);
        //매장 운영 정보
        const storeOpenChk = await this.storeService.getStoreOpenChk(storeId);
        let body = {
            storeDetail: storeDetail,
            productList: productList,
            storeOpenChk: storeOpenChk,
            statusCode: 200
        }
        return res.json(body);
    }

    //상품 상세
    @Get('product/detail')
    async getProductDetail(@Res() res:Response, 
                        @Query('storeId') storeId: string,
                        @Query('productId') productId: string) {
        //매장 운영 확인
        const storeOpenChk = await this.storeService.getStoreOpenChk(storeId);
        
        //아이템 상세정보 조회
        //get_item_info //외부 api
        const productDetail = await this.productService.getProductDetail(productId);                           
        let body = {
            storeOpenChk: storeOpenChk,
            productDetail: productDetail,
            statusCode: 200
        }
        return res.json(body);        
    } 

    //주문 목록 order_history.php
    async orderList() {
        //주문목록 조회 
        //get_order_list 외부 api

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
