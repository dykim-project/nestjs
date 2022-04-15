import { Column, Model, Table } from 'sequelize-typescript';
@Table
export class payment extends Model {
    @Column({primaryKey: true})
    id: number;
  
    @Column
    name: string;

    @Column
    account: number;

    @Column({ defaultValue: 0 })
    total: number;
}