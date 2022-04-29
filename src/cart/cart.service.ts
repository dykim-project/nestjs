
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { logger } from "src/config/winston";
import { CartDto } from "src/dto/cartDto";
import { Basket } from "src/entity/basket.entity";
import { userInfo } from "src/entity/userInfo.entity";
import { kisServerCon } from '../utils/kis.server.connection';
import { common } from '../utils/common';
import { AddCartDto } from "src/dto/addCartDto";

@Injectable()
export class CartService {
    constructor(
        @InjectModel(userInfo)
        private userInfoModel: typeof userInfo
    ) {}
    //장바구니 등록
    //return 갯수, 총금액
    async addCart(addCartDto: AddCartDto): Promise<any> {
        try{
            //phpsource 외부 api - insert_cart_option 
            //$cart_result = insert_cart_option($uid, $store_id, $main_item_id, $main_item_qty, $option_select_type, $option_item_id, $option_item_qty);

            //실패 -> if ($cart_result['rst'] == 0) {
            let data = {brdId:'', 
                        strId: addCartDto.storeId,
                        prdId: addCartDto.itemId,
                        chnlMbrId: addCartDto.uid,
                        totalCnt: addCartDto.itemQty};



            //-------------------------------------
                // 메인상품 입력

            // 옵션상품 입력
            /*$param_option_id = array();
            $option_select_type = explode("::", $option_select_type);
            $option_item_id = explode("::", $option_item_id);
            $option_item_qty = explode("::", $option_item_qty);
            for ($i = 0; $i < count($option_select_type); $i++) {
                if ($option_item_id[$i] != "") {
                    if ($option_select_type == "SS") {

                        $param_option_id[] = $option_item_id[$i];

                    } else {
                        $option_item_id_multi = explode("||", $option_item_id[$i]);
                        $option_item_qty_multi = explode("||", $option_item_qty[$i]);
                        for ($j = 0; $j < count($option_item_id_multi); $j++) {

                            $param_option_id[] = $option_item_id_multi[$j];

                        }
                    }
                }
            }*/
            data = {...data, ...{optPrdIds:''}} //param_option_id
            //-------------------------------------
            let result = await kisServerCon('/api/channel/nonpage/bask/insert', data);
            if(result.data.success) {
                result = result.data.data;
            } else {
                common.logger(result.data, '[payment.addCart]');
                common.errorException(502, 'ADD_CART_FAIL', result.data);
            }
            return true;
        } catch(error) {
            //front - 상품 담기 중 에러가 발생했습니다.\n에러가 지속되면 관리자에게 문의해주세요
            throw new InternalServerErrorException('ADDCART_FAIL');
        }
    } 
    
    //장바구니 조회 
    //phpsorce - get_basket_info
    async getCartList(uid: number): Promise<any> {
        const data = {chnlMbrId: uid};
        let result = await kisServerCon('/api/channel/nonpage/bask/select', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result.data, '[cart.getCartList]');
            common.errorException(502, 'GET_CART_FAIL', result.data);
        }
        return result;
    }

    //장바구니 상단 갯수 표기
    getCartTotalCnt(basketList: any) {
        let sumProductQty = 0;
        let sumProductPrice = 0;
        basketList.forEach(data => {
            let itemType = data.prdOptCd;
            if(itemType === "S") { //메인 아이템인 경우
                let itemQty = data.ordrCnt;
                let itemPrice = data.salePrc;
                sumProductQty += itemQty;
                sumProductPrice += (itemQty * itemPrice);                
            } else { //옵션 아이템인 경우
                let itemQty = data.ordrCnt;
                let itemPrice = data.salePrc;
                sumProductPrice += (itemQty * itemPrice);
            }
        });
        return {sumProductQty, sumProductPrice};
    }

    //장바구니상품 재고 확인
    async chkBasketStock(basket: Basket): Promise<boolean> {
        //phpsorce - get_basket_info 외부 api로 품절확인
        return true;
    }
    
    //사용자 정보 저장
    async saveUserInfo(cartDto: CartDto) {
        try {
            const [instance, created]  =  await this.userInfoModel.upsert({
                uid: cartDto.uid,
                userName: cartDto.userName,
                pushToken: cartDto.pushToken, //'2020202020'
            });
        } catch(error) {
            common.logger(error, '[cart.saveUserInfo]');
            common.errorException(502, 'SAVEUSER_INFO', error);
        }
    }

    //장바구니 삭제 
    async deleteAllCart(uid: number) {
        const data = {chnlMbrId: uid};
        let result = await kisServerCon('/api/channel/nonpage/bask/delete', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result.data, '[cart.deleteAllCart]');
            common.errorException(502, 'DELETE_ALL_CART_FAIL', result.data);
        }
    }

    //장바구니 item 삭제 
    async deleteOneCart(uid:number, itemId: string) {
        const data = {chnlMbrId: uid, baskDtlId: itemId};
        let result = await kisServerCon('/api/channel/nonpage/bask/delete', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result.data, '[cart.deleteOneCart]');
            common.errorException(502, 'DELETE_CART_FAIL', result.data);
        }
        return result;
    } 
    
}