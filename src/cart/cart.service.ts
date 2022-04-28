
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Basket } from "src/entity/basket.entity";

@Injectable()
export class CartService {
    constructor() {}
    //장바구니 등록
    addCart(): boolean {
        try{
            //phpsource 외부 api - insert_cart_option 
            //실패 -> if ($cart_result['rst'] == 0) {
            return true;
        } catch(error) {
            //front - 상품 담기 중 에러가 발생했습니다.\n에러가 지속되면 관리자에게 문의해주세요
            throw new InternalServerErrorException('ADDCART_FAIL');
        }
    } 
    
    //장바구니 추가 
    //ajax_insert_cart (menu_detail & cart 에서 )
    //장바구니 조회 
    //phpsorce - get_basket_info
    async getCartList(uid: number): Promise<Basket[]> {
        const basketList = new Array<Basket>();
        return basketList;
    }

    //장바구니상품 재고 확인
    async chkBasketStock(basket: Basket): Promise<boolean> {
        //phpsorce - get_basket_info 외부 api로 품절확인
        return true;
    }
    
}