import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { payment } from './payment.entity';
import { PaymentRepository } from './payment.repository';
@Injectable()
export class PaymentService {
//@types/sequelize 사용  app.module에서 주소 설정함 
    constructor(
        @InjectModel(payment)
        private paymentModel: typeof payment,
      ) {}

      async findAll(): Promise<payment[]> {
        return this.paymentModel.findAll();
      }
      //User.findOne({},{ where: { id: 32 }, attributes: ['first_name', 'last_name'] })
      findOne(id: string): Promise<payment> {
        return this.paymentModel.findOne(
          { where: { id: id } }
        );
      }

      findElse(id: string): void {
        let result = new payment();
        this.paymentModel.findOne(
          { where: { id: id } }
        ).then(async (payment) => {
          payment.name = 'change';
          result  = await payment.save();
        
        });
        console.log(result.name);
      }
    
     // async manyTo(): Promise<payment[]> {
        //User.hasOne(Profile) 
        //Profile.belongsTo(User)
        //Project.belongsToMany(User, {through: 'UserProject'}); 
        //User.belongsToMany(Project, {through: 'UserProject'});
        //User.belongsToMany(Project, { as: 'Tasks', through: 'worker_tasks', foreignKey: 'userId' }) 
        //Project.belongsToMany(User, { as: 'Workers', through: 'worker_tasks', foreignKey: 'projectId' })
      //}
      async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await user.destroy(); //삭제 
      }
     create(): Promise<payment> {
      let payment = { name: 'test', account:400, total:6500} 
      return this.paymentModel.create(payment);
    }

    update(res: Response): void{
      this.paymentModel.update(
        {
          name: 'bobby',
        },
        { where: { id: 1 } }
      ).then(() => { return res.json({"status": 200, "message": "success"}) })
    }
}
