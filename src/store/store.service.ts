import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { CommonDto } from "src/dto/commonDto";
import { Sequelize } from 'sequelize';
import { Store } from "src/entity/store.entity";
import { kisServerCon } from '../utils/kis.server.connection';
import { common } from '../utils/common';

@Injectable()
export class StoreService {
    constructor(
        @InjectConnection()
        private sequelize: Sequelize,
    ) {}

    //매장 목록
    //return storeEntity list
    async getStoreList(): Promise<any> {
        let result = await kisServerCon('/api/channel/nonpage/store/select');
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result?.data, '[payment.getStoreList]');
            common.errorException(502, 'GET_STORE_LIST_FAIL', result.data);
        }
        return result;
    }
    
    //매장 정보 
    //phpsource 외부api- get_store_info($store_id) 
    //return storeEntity
    async getStoreDetail(storeId: string):Promise<Store> {
        let data = {strId: storeId};
        let result = await kisServerCon('/api/channel/nonpage/store/get', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result.data, '[payment.getStoreList]');
            common.errorException(502, 'GET_STORE_LIST_FAIL', result.data);
        }
        return result;
    }


    //매장 운영 확인
    //phpsoruce - get_store_info($store_id) 
    //return true(운영) /false (운영안함)
    async getStoreOpenChk(storeId: string, storeDetail?: any): Promise<boolean> {
        let result = false;
        
        try {
            //매장상세 정보 get 
            const date = new Date();
            const storeData = storeDetail ? storeDetail : this.getStoreDetail(storeId);
            //매장 상세 정보로 운영시간 계산
            const runTimeList = storeData.strOphVos;
            const today = common.getInputDayLabel() + 1; //월요일 2부터 
            const hour = ("0" + date.getHours()).slice(-2);
            const minute = ("0" + date.getMinutes()).slice(-2);
            const time = hour + minute;
            runTimeList.forEach(data =>{
                //요일 비교
                if(data.dayCd == today) {
                    //시간 비교
                    if(data.staTm <= time && time <=data.endTm) {
                        result = true;
                    }
                }
            })
            return result;
        } catch(error) {

        }
    }

}