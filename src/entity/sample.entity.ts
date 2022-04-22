import { AutoIncrement, Column, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import sequelize from 'sequelize/types/sequelize';

@Table({
    tableName: 'test',
    updatedAt: false ,
    timestamps: true, 
  }) 
  //({ createdAt: false, updatedAt: false }
export class sample extends Model {
    @AutoIncrement
    @Column({primaryKey: true})
    id: number;
  
    @Column
    name: string;

    @Column
    account: number;

    @Column({ defaultValue: 0 })
    total: number;

   // @HasMany(() => refund)
   // refunds: refund[];
    
}