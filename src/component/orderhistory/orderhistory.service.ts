import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/sequelize';
import { kisServerCon } from '../../utils/kis.server.connection';
import { common } from '../../utils/common';
import { order } from 'src/entity/order.entity';
@Injectable()
export class OrderhistoryService {
    constructor(
        @InjectModel(order)
        private orderModel: typeof order,
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

    //주문정보, 주문아이디로 매장정보 가져오기 
    
    async getOrderStore(ordrId: string) {
        const result = await this.orderModel.findOne(
        { where: { orderId: ordrId } , 
        attributes:['storeId']});
        return result.storeId;
    }
  
}