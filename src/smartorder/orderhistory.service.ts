import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from 'sequelize';
import { kisServerCon } from '../utils/kis.server.connection';
import { common } from '../utils/common';

@Injectable()
export class OrderHistoryService {
    constructor(
    ) {}

    //주문 목록
    async getOrderList(uid: number): Promise<any> {
        const data = {chnlMbrId: uid};
        let result = await kisServerCon('/api/channel/nonpage/order/select', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result.data, '[orderhistory.getOrderList]');
            common.errorException(502, 'GET_ORDER_HISTORY_FAIL', result.data);
        }
        return result;
    }
}