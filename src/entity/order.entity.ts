import { AutoIncrement, Column, DataType, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import { orderDetail } from './orderDetail.entity';

@Table({
    tableName: 'ks_order',
    updatedAt: false ,
    createdAt: false,
    timestamps: true, 
  }) 
  //({ createdAt: false, updatedAt: false }
export class order extends Model {
    @AutoIncrement
    @Column({field:'order_id', primaryKey: true})
    orderId: string;

    @Column({field:'user_seq', defaultValue:0})
    userSeq: number;

    @Column({field:'store_id'})
    storeId: string;

    @Column({field:'status', defaultValue:'0000'})
    status: string;

    //0 - pickup
    @Column({field:'order_type' , defaultValue:0})
    orderType: number;

    @Column({field:'order_date'})
    orderDate: number;

    @Column({field:'order_ymd'})
    orderYmd: string;

    @Column({field:'order_y'})
    orderY: string;

    @Column({field:'order_m'})
    orderM: string;

    @Column({field:'order_d'})
    orderD: string;

    @Column({field:'order_w'})
    orderW: string;

    @Column({field:'pay_type', defaultValue: ''})
    payType: string;

    @Column({field:'sum_item_qty', defaultValue: 0})
    sumProductQty: number;

    @Column({field:'total_price', defaultValue: 0, type: DataType.FLOAT}) 
    totalPrice: number;

    @Column({field:'pay_price', defaultValue: 0, type: DataType.FLOAT}) 
    payPrice: number;

    @Column({field:'discount_price', defaultValue: 0, type: DataType.FLOAT}) 
    discountPrice: number;

    @Column({field:'delivery_price', defaultValue: 0, type: DataType.FLOAT}) 
    deliveryPrice: number;

    @Column({field:'coupon_category'})
    couponCategory: number;

    @Column({field:'coupon_id'})
    couponId: string;

    @Column({field:'coupon_title'})
    couponTitle: string;

    @Column({field:'addr'})
    addr: string;

    @Column({field:'tel'})
    tel: string;

    @Column({field:'sum_reward_point', defaultValue: 0, type: DataType.FLOAT}) 
    sumRewardPoint: number;

    @Column({field:'sum_reward_stamp', defaultValue: 0})
    sumRewardStamp: number;

    @Column({field:'point_price', type: DataType.FLOAT}) 
    pointPrice: number;

    @Column({field:'uid'})
    uid: string;

    @Column({field:'user_id'})
    userId: string;

    @Column({field:'user_name'})
    userName: string;

    @Column({field:'os_type'})
    osType: string;

    @Column
    mid: string;

    @Column
    moid: string;

    @Column
    tid: string;

    @Column
    amt: string;

    @Column({field:'auth_code'})
    authCode: string;

    @Column({field:'card_code'})
    cardCode: string;

    @Column({field:'card_name'})
    cardName: string;
  
    @HasMany(() => orderDetail)
    refunds: orderDetail[];
}