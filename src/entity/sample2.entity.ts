import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
@Table({
    tableName: 'productt',
    updatedAt: false ,
    timestamps: true, 
  }) 
export class sample2 extends Model {
    @Column({primaryKey: true})
    id: number;
  
    @Column('name')
    name_222: string;

    @Column
    age: number;

    @Column
    productName: string;

    @Column({ defaultValue: true })
    isActive: boolean;

    // @ForeignKey(() => Sample)
    // @Column
    // proofreaderId: number
    
    //persen에 있는거 가져다 쓸수 있음 
    //@BelongsTo(() => Person)
    //proofreader: Person
}