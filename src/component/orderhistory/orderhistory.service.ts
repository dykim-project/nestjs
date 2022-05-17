import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/sequelize';
import { kisServerCon } from '../../utils/kis.server.connection';
import { common } from '../../utils/common';
import { order } from 'src/entity/order.entity';
import { orderDetail } from 'src/entity/orderDetail.entity';
@Injectable()
export class OrderhistoryService {
    constructor(
        @InjectModel(order)
        private orderModel: typeof order,
        @InjectModel(orderDetail)
        private orderDetailModel: typeof orderDetail
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

    //주문아이디로 매장아이디 가져오기 
    async getOrderStoreId(ordrId: string) {
        const result = await this.orderModel.findOne(
        { where: { orderId: ordrId } , 
        attributes:['storeId']});
        return result? result.storeId: '';
    }

    //주문정보
    async getOrderData(ordrId: string) {
        const result = await this.orderModel.findOne(
        { where: { orderId: ordrId }});
        return result;
    }

    //kis 서버 주문 정보
    async getOrderKisData(uid: number, ordrId: string): Promise<any> {
        
        const data = {chnlMbrId: uid, ordrId: ordrId};
        let result = await kisServerCon('/api/channel/nonpage/order/get', data);
        if(result.data.success) {
            result = result.data.data;
        } else {
            common.logger(result.data, '[orderhistory.getOrderDetail]');
            common.errorException(502, 'GET_ORDER_ORDER_DETAIL_FAIL', result.data);
        }
        return result;
    }

    //주문정보
    async getOrderDetail(ordrId: string) {
        const result = await this.orderDetailModel.findAll(
        { where: { orderId: ordrId }});
        return result;
    }

}