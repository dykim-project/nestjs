import { Body, Controller, Get, Header, Param, ParseIntPipe, Post, Query, Res, ServiceUnavailableException } from '@nestjs/common';
import { Response } from 'express';
import { CartService } from 'src/component/cart/cart.service';
import { ProductService } from './product.service';
import { StoreService } from './store.service';
import { kisServerCon } from '../../utils/kis.server.connection';
@Controller()
export class StoreController {
    constructor(private readonly storeService: StoreService,
                private readonly productService: ProductService,
                private readonly cartService: CartService) {}
                
    //매장 목록
    @Get('store/list')
    async getStoreList(@Res() res:Response):Promise<any> {
      const result = await this.storeService.getStoreList();
      //getcategory
      return res.json(result);
    }

    //매장 상세(상품 목록)
    //http://localhost:3000/store/detail?uid=111&storeId=ST00005937
    @Get('store/menuList')
    async getStoreDetail(@Res() res: Response,
                        @Query('uid') uid: number,
                        @Query('storeId') storeId: string): Promise<any> {
        //1.장바구니 정보 가져와서 같은 가게가 아니면 장바구니 삭제 
        let cartList = await this.cartService.getCartList(uid);
        //장바구니에 담긴 상품이 현재 매장 상품이 아닌경우 - 장바구니 전체 삭제 
        if(cartList.length > 0 && cartList[0].strId !== storeId) {
           await this.cartService.deleteAllCart(uid);
           cartList = [];
        }
        let cartCnt = this.cartService.getCartTotalCnt(cartList);
        //매장상세 정보(상단 매장정보)
        //get_store_info($store_id); //외부 api 사용 ST00005937
        const storeDetail = await this.storeService.getStoreDetail(storeId);
        //카테고리 목록
        const categoryList = await this.productService.getCategoryList(storeId);
        console.log('categoryList');
        console.log(categoryList);
        //상품 목록
        //get_item_list //외부 api 사용
        const productList = await this.productService.getProductList(storeId);
        //매장 운영 정보
       const storeOpenChk = await this.storeService.getStoreOpenChk(storeId, storeDetail);

        //장바구니 정보 상세(장바구니 상단 표기 숫자)
       
         let body = {
             cartCnt,
             storeDetail,
             productList,
             storeOpenChk,
             categoryList,
             statusCode: 200
        }
        return res.json(body);
    }

    //상품 상세
    @Get('menu/detail')
    async getProductDetail(@Res() res:Response, 
                        @Query('storeId') storeId: string,
                        @Query('itemId') itemId: string) {
        //매장 운영 확인
        const storeOpenChk = await this.storeService.getStoreOpenChk(storeId);
        
        //아이템 상세정보 조회
        const productDetail = await this.productService.getProductDetail(storeId, itemId);                           
        let body = {
            storeOpenChk,
            productDetail,
            statusCode: 200
        }
        return res.json(body);        
    } 

    //카테고리의 상품
    @Get('category/items')
    async getCategoryItems(@Res() res:Response, 
                        @Query('storeId') storeId: string,
                        @Query('category') itemId: string) {
        //카테고리상품조회
        const productList = await this.productService.getProductList(storeId, itemId);                           
        let body = {
            productList,
            statusCode: 200
        }
        return res.json(body);        
    } 



}
