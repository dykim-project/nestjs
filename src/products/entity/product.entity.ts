import { Column, Model, Table } from 'sequelize-typescript';
@Table
export class Product extends Model {
    @Column({primaryKey: true})
    id: number;
  
    @Column
    name: string;

    @Column
    age: number;

    @Column({ defaultValue: true })
    isActive: boolean;
}