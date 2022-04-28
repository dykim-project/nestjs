import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { CommonDto } from "src/dto/commonDto";
import { QueryTypes, Sequelize } from 'sequelize';
import { resourceLimits } from "worker_threads";
import { Store } from "src/entity/store.entity";
import { Product } from "src/entity/product.entity";
class Result {
    result: boolean
}

@Injectable()
export class StoreService {
    constructor(
        @InjectConnection()
        private sequelize: Sequelize,
    ) {}

    //매장 목록
    //return storeEntity list
    async getStoreList(): Promise<Store[]> {
        const result = new Array<Store>();
        return result;
    }
    
    //매장 정보 
    //phpsource 외부api- get_store_info($store_id) 
    //return storeEntity
    async getStoreDetail(storeId: string):Promise<Store> {
        return true;
    }


    //매장 운영 확인
    //phpsoruce - get_store_info($store_id) 
    //return true(운영) /false (운영안함)
    async getStoreOpenChk(storeId: string): Promise<boolean> {
        //let result = false;
        
        try {
            //매장상세 정보 get 
            const result = this.getStoreDetail(storeId);
            //매장 상세 정보로 운영시간 계산
            return true;
        } catch(error) {
        }
    }

}