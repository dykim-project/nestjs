import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { CommonDto } from "src/dto/commonDto";
import { QueryTypes, Sequelize } from 'sequelize';
import { resourceLimits } from "worker_threads";
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
    async getStoreList() {
        return true;
    }
    
    //매장 상세
    //return storeEntity
    async getStoreDetail(storeId: string) {
        return Promise.resolve(true);
    }


    //매장 운영 확인
    //return storeStatus: true/ false
    //phpsoruce - get_store_info($store_id) 
    async getStoreOpenChk(storeId: string): Promise<boolean> {
        //let result = false;
        
        try {
          let result:Result = await this.sequelize.query("select false as result", 
          { type: QueryTypes.SELECT, 
            plain: true,
        });
        return result.result;
        console.log(result);
        } catch(error) {
        }
    }

}