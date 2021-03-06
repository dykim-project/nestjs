
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/sequelize";
import { logger } from "src/config/winston";
import { CartDto } from "src/dto/cartDto";
import { kisServerCon } from '../../utils/kis.server.connection';
import { common } from '../../utils/common';
import { AddCartDto } from "src/dto/addCartDto";
const Sequelize = require('sequelize');
@Injectable()
export class CartService {
    constructor(
        @InjectConnection('accountdb')   
        private sequelize: typeof Sequelize,
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
                return false;
            }
            return true;
        } catch(error) {
            //front - 상품 담기 중 에러가 발생했습니다.\n에러가 지속되면 관리자에게 문의해주세요
            logger.error('addcart catch error---');
            logger.error(error);
            return false;
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
            logger.error('장바구니 조회 오류 ');
            common.logger(result.data, '[cart.getCartList]');
            return [];
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

    //장바구니 삭제 
    async deleteAllCart(uid: number) {
        const data = {chnlMbrId: uid};
        let result = await kisServerCon('/api/channel/nonpage/bask/delete', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result.data, '[cart.deleteAllCart]');
            return false;
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
            return false;
        }
        return result;
    } 

    //쿠폰 & 포인트 정보
    async getCouponPoint(uid:number) {
        const [userInfo] = await this.sequelize.query(`SELECT name, phone, email, point FROM user WHERE idx =${uid}`, { type: this.sequelize.QueryTypes.SELECT});
        const [coupons] = await this.sequelize.query(`SELECT userCoupon.idx, coupon.couponName, coupon.couponDesc, coupon.discountType, coupon.discountAmount, coupon.maxDiscount
        FROM userCoupon
        JOIN coupon ON userCoupon.couponIdx=coupon.idx
        WHERE userCoupon.userIdx=${uid} AND userCoupon.isUsed='N' AND coupon.usableOffline=1 AND coupon.startDate<=Date(NOW()) AND coupon.endDate>=DATE(NOW())`);
        return {point:userInfo.point, coupons}
    }

    //카드목록
    async getCardList(uid:number) {
        // NC 다이노스 페이
        const [cardList] = await this.sequelize.query(`SELECT id, cardNo, cardName FROM ncPay WHERE userIdx =${uid}`);
                
        return cardList
    }
    
}