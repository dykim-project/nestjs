
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { logger } from "src/config/winston";
import { CartDto } from "src/dto/cartDto";
import { Basket } from "src/entity/basket.entity";
import { userInfo } from "src/entity/userInfo.entity";
import { kisServerCon } from '../../utils/kis.server.connection';
import { common } from '../../utils/common';
import { AddCartDto } from "src/dto/addCartDto";
import { isNotEmpty } from "class-validator";

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
            let data = {brdId:'', 
                        strId: addCartDto.storeId,
                        prdId: addCartDto.itemId,
                        chnlMbrId: addCartDto.uid,
                        totalCnt: addCartDto.itemQty
                        }; 
            //-------------------------------------
            let optPrdIds = addCartDto.optionIds  && addCartDto.optionIds.length > 0 ? addCartDto.optionIds : [];
            data = {...data, ...{optPrdIds:optPrdIds}} //param_option_id
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
            logger.error('addcart catch error---');
            logger.error(error);
            throw new InternalServerErrorException('ADDCART_FAIL');
        }
    } 
    
    //장바구니 조회 
    //phpsorce - get_basket_info
    async getCartList(uid: number): Promise<any[]> {
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

    //총갯수 금액 
    getCartTotalCnt(basketList: any) {
        let sumProductQty = 0;
        let sumProductPrice = 0;
        let itemCnt = 0;
        basketList.forEach(data => {
            let itemType = data.prdOptCd;
            if(itemType === "S") { //메인 아이템인 경우
                let itemQty = parseInt(data.ordrCnt);
                let itemPrice = data.salePrc;
                sumProductQty += itemQty;
                sumProductPrice += (itemQty * itemPrice);    
                itemCnt+=1;            
            } else { //옵션 아이템인 경우
                let itemQty = data.ordrCnt;
                let itemPrice = data.optPrc;
                sumProductPrice += (itemQty * itemPrice);
            }
        });
        return {sumProductQty, sumProductPrice, itemCnt};
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
    async deleteOneCart(uid:number, basketDetailId?: string) {
        const data = {chnlMbrId: uid, baskDtlId: basketDetailId};
        console.log(data);
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