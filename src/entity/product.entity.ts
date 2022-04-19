import { Column, Model, Table } from 'sequelize-typescript';
@Table({
    tableName: 'productt',
    updatedAt: false ,
    timestamps: true, 
  }) 
export class product extends Model {
    @Column({primaryKey: true})
    id: number;
  
    @Column
    name: string;

    @Column
    age: number;

    @Column
    productName: string;

    @Column({ defaultValue: true })
    isActive: boolean;
}