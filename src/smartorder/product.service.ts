import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CommonDto } from "src/dto/commonDto";

@Injectable()
export class ProductService {
    constructor() {}
    //상품 목록 //
    getProductList(storeId: string) {

    }

    //아이템 상세
    async getProductDetail(productId: string) {
        try {

        } catch(error) {
            throw new InternalServerErrorException(error);
        }   

    }

    //재고 확인 
    getProductStockChk(productId: string) {
        return false;
    }
}