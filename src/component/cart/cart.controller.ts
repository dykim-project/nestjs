import { Body, Controller, Get, Header, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { logger } from 'src/config/winston';
import { AddCartDto } from 'src/dto/addCartDto';
import { CartDto } from 'src/dto/cartDto';
import { DeleteCartDto } from 'src/dto/deleteCartDto';
import { ProductDto } from 'src/dto/productDto';
import { ProductService } from 'src/component/store/product.service';
import { StoreService } from 'src/component/store/store.service';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService,
                private readonly storeService: StoreService,
                private readonly productService: ProductService,) {}
     
     //장바구니 조회 cart.php
     @Get('list')
     async cartList(@Res() res:Response, 
                    @Query('uid') uid: number,
                    @Query('storeId') storeId: string,
                    @Query('userName') userName: string) {
        try {
         //장바구니 화면으로 진입했을때-> 사용자 정보 저장
         //uid, user_name, push_toke
         let cartDto:CartDto = {uid: uid,
                        storeId: storeId,
                        userName: userName? userName: '',
                        pushToken:''};
         await this.cartService.saveUserInfo(cartDto);
 
         const storeDetail = await this.storeService.getStoreDetail(cartDto.storeId);
         //매장 운영 확인
         const storeOpenChk = await this.storeService.getStoreOpenChk(cartDto.storeId ,storeDetail);
         //장바구니 정보
         const cartList = await this.cartService.getCartList(cartDto.uid);
         const {sumProductQty, sumProductPrice} = await this.cartService.getCartTotalCnt(cartList);
         const body = {cartList,
                        storeOpenChk,
                        storeDetail,
                        sumProductQty,
                        sumProductPrice,
                        statusCode: 200};
        return res.json(body);
        } catch(error) {
            logger.log('[cart.cartList]');
            logger.log(error);
        }
    }

    //상품상세 - 장바구니 추가& 주문하기버튼 ajax_insert_cart.php 참고
     @Post('add') 
     async addCart(@Res() res:Response, @Body() addCartDto: AddCartDto) {
         //주문하기
         if(addCartDto.orderType === 'order') {
             const storeOpenChk = await this.storeService.getStoreOpenChk(addCartDto.storeId);
             if(!storeOpenChk) {
                 //front - 지금은 주문하실 수 없습니다.
                 return res.json({statusCode: 200, resultMsg: 'NOT_OPEN'});
             }
         }
 
         //아이템 품절 확인 
         const productStockChk = await this.productService.getProductStockChk(addCartDto.storeId, addCartDto.itemId); 
         if(productStockChk) {
             //장바구니 상품 수량변경
             const result = await this.cartService.addCart(addCartDto);
             if(result) {
                return res.json({statusCode: 200});
             }
         } else {
            return res.json({statusCode: 200, resultMsg: 'SOLDOUT'});
         }
     }
 
     //장바구니 삭제 ajax_delete_cart.php
     @Get('delete')
     async deleteCart(@Res() res:Response,  @Query('uid') uid: number, @Query('basketDetailId') baskDtlId: string) {
         //삭제
         await this.cartService.deleteOneCart(uid, baskDtlId);
         return res.json({statusCode:200});
     }
}
