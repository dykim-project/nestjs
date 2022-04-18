import { AutoIncrement, Column, Model, Sequelize, Table } from 'sequelize-typescript';
import sequelize from 'sequelize/types/sequelize';

@Table({
    tableName: 'test',
    updatedAt: false ,
    timestamps: true, //createdAt 와 updatedAt 자동생성 
  }) 
  //({ createdAt: false, updatedAt: false }
export class payment extends Model {
    @AutoIncrement
    @Column({primaryKey: true})
    id: number;
  
    @Column
    name: string;

    @Column
    account: number;

    @Column({ defaultValue: 0 })
    total: number;
   
    //@Column ({ defaultValue: Sequelize.fn('now')})
    //createdAt: Date;
    //@자동으로 생성 되는지 확인 
    
}