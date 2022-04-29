import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { kisServerCon } from '../utils/kis.server.connection';
import { common } from '../utils/common';
@Injectable()
export class ProductService {
    constructor() {}

    //카테고리 목록
    async getCategoryList(storeId: string) {
        const data = {strId: storeId};
        let result = await kisServerCon('/api/channel/nonpage/category/select', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result.data, '[cart.getCategoryList]');
            common.errorException(502, 'GET_CATEGORY_FAIL', result.data);
        }
        return result;
    }

    //상품목록 
    async getProductList(storeId: string, category: string = '') {
        const data = {strId: storeId,
                      brdCtgId: category};
        let result = await kisServerCon('/api/channel/nonpage/product/select', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result.data, '[cart.getProductList]');
            common.errorException(502, 'GET_PRODUCT_FAIL', result.data);
        }
        return result;
    }

    //아이템 상세 get_item_info
    async getProductDetail(storeId: string, itemId: string) {
        const data = {strId: storeId, prdId: itemId};
        let result = await kisServerCon('/api/channel/nonpage/product/get', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result.data, '[product.getProductDetail]');
            common.errorException(502, 'GET_ITEM_FAIL', result.data);
        }
        return result;

    }

    //재고 확인 
    ////get_item_info 외부 api로 품절확인 
    //true 재고있음 false 재고 없음
    getProductStockChk(productId: string) {
        return false;
    }
}