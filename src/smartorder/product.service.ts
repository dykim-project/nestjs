import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CommonDto } from "src/dto/commonDto";

@Injectable()
export class ProductService {
    constructor() {}
    //상품 목록 //
    getProductList(storeId: string) {
        return true;
    }

    //아이템 상세
    async getProductDetail(productId: string) {
        try {

        } catch(error) {
            throw new InternalServerErrorException(error);
        }   

    }

    //재고 확인 
    ////get_item_info 외부 api로 품절확인 
    //true 재고있음 false 재고 없음
    getProductStockChk(productId: string) {
        return false;
    }
}