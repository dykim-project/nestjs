import { AutoIncrement, Column, Model, Table } from 'sequelize-typescript';

@Table({
    tableName: 'user_info',
    updatedAt: false ,
    createdAt: false ,
    timestamps: true, 
  }) 
  //({ createdAt: false, updatedAt: false }
export class userInfo extends Model {
    @AutoIncrement
    @Column({primaryKey: true})
    uid: number;
  
    @Column({field: 'user_name'})
    userName: string;

    @Column({field: 'push_token'})
    pushToken: string;
    
 }