import { Column, Model, Table } from 'sequelize-typescript';
@Table
export class product extends Model {
    @Column({primaryKey: true})
    id: number;
  
    @Column
    name: string;

    @Column
    age: number;

    @Column({ defaultValue: true })
    isActive: boolean;
}