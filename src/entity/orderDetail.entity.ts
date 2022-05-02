import { AutoIncrement, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { order } from './order.entity';

@Table({
    tableName: 'ks_order_detail',
    updatedAt: false ,
    createdAt: false,
    timestamps: true, 
  }) 
  //({ createdAt: false, updatedAt: false }
export class orderDetail extends Model {
    @AutoIncrement
    @Column({primaryKey: true})
    seq: number;
  
    @ForeignKey(() => order)
    @Column({field: 'order_id'})
    orderId: string;

    @Column({field: 'user_seq'})
    userSeq: number;

    @Column({field: 'store_id'})
    storeId: string;

    @Column({field: 'item_id'})
    itemId: string;

    @Column({field: 'item_type', defaultValue:'O'})
    itemType: string; // S메인상품 O옵션상품

    @Column({field: 'item_name'})
    itemName: string;

    @Column({field:'item_price', type: DataType.FLOAT}) 
    itemPrice: number;
    
    @Column({field: 'item_qty'})
    itemQty: number;

    @Column({field:'reward_point', type: DataType.FLOAT , defaultValue:0}) 
    rewardPoint: number;

    @Column({field: 'reward_stamp', defaultValue:0})
    rewardStamp: number;

    @Column({field: 'basket_id'})
    basketId: string;

    @Column({field: 'basket_id_detail'})
    basketIdDetail: string;

    @Column({field: 'reg_date'})
    regDate: number;



    //@HasMany(() => sample2)
    //refunds: sample2[];
    
}