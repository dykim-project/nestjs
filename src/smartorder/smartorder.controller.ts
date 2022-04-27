import { Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Query, Res, ServiceUnavailableException } from '@nestjs/common';
import { Response } from 'express';
import { CommonDto } from 'src/dto/commonDto';
import { ProductDto } from 'src/dto/productDto';
import { PaymentService } from 'src/payment/payment.service';
import { ProductService } from './product.service';
import { StoreService } from './store.service';

@Controller()
export class SmartorderController {
    constructor(private readonly storeService: StoreService,
                private readonly productService: ProductService,
                private paymentService: PaymentService) {}
    
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

        //매장상세 정보
        const storeDetail = await this.storeService.getStoreDetail(storeId);
        //상품 목록
        const productList = await this.productService.getProductList(storeId);
        //매장 운영 정보
        const storeOpenChk = await this.storeService.getStoreOpenChk(storeId);
        let body = {
            storeDetail: storeDetail,
            productList: productList,
            storeOpenChk: storeOpenChk
        }
        return res.json(body);
    }

    //product 상세
    @Get('product/detail')
    async getProductDetail(@Res() res:Response, 
                        @Query('storeId') storeId: string,
                        @Query('productId') productId: string) {
        //매장 운영 확인
        const storeOpenChk = await this.storeService.getStoreOpenChk(storeId);
        //아이템 상세정보 조회
        const productDetail = await this.productService.getProductDetail(productId);                           
        let body = {
            storeOpenChk: storeOpenChk,
            product: productDetail,
            statusCode: 200
        }
        return res.json(body);        
    } 

    //장바구니 추가 
    @Post('cart/add')
    async setCart(@Res() res:Response, @Body() productDto: ProductDto) {
        //아이템 품절 확인 
        const productStockChk = await this.productService.getProductStockChk(productDto.productId); 
        if(productStockChk) {
            //장바구니 상품 수량변경
        }
       
    }

    //결제하기
    @Post('payment') 
    async order(@Res() res:Response, @Body() productDto: ProductDto) {
        //매장 영업시간 재확인 
        const storeOpenChk = await this.storeService.getStoreOpenChk(productDto.storeId);
        const stockChk = await this.productService.getProductStockChk(productDto.productId); 
        let body = {storeOpenChk: storeOpenChk,
                    stockChk: stockChk};
        
        //장바구니 품절 확인 
        
        //주문 프로세스 (매장영업시간 & 재고충분)
        if(storeOpenChk && stockChk) {
           
        } else {

        }
        res.json(body);
        
    }


    //장바구니 조회 

    //장바구니 변경(아이템, 갯수, uid)

    //주문 목록

    //주문 상세 

}
