import { AutoIncrement, Column, ForeignKey, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import { payment } from '../entity/payment.entity';

@Table({
    tableName: 'test2',
    updatedAt: false ,
    timestamps: true, 
  }) 
  //({ createdAt: false, updatedAt: false }
export class refund extends Model {
    @AutoIncrement
    @Column({primaryKey: true})
    id: number;
  
    @ForeignKey(() => payment)
    @Column
    paymentId: number;

    @Column
    refundName: string;

    @Column
    result: string;

    @Column
    account: number;

    @Column({ defaultValue: 0 })
    total: number;
    
}