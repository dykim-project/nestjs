import { Inject, Injectable } from '@nestjs/common';
import { InjectModel, getConnectionName, InjectConnection } from '@nestjs/sequelize';
import { Response } from 'express';
import { payment } from '../entity/payment.entity';
import { refund } from '../entity/refund.entity';
import { Sequelize } from 'sequelize';

@Injectable()
export class PaymentService {
    constructor(
        @InjectModel(payment)
        private paymentModel: typeof payment,

        @InjectModel(refund)
        private refundModel: typeof refund,

        @InjectConnection()
        private sequelize: Sequelize,
      ) {}

      async findAll(): Promise<payment[]> {
        return this.paymentModel.findAll();
      }
      //User.findOne({},{ where: { id: 32 }, attributes: ['first_name', 'last_name'] })
      async findOne(id: number): Promise<void> {
        try {
        const result = await this.paymentModel.findAndCountAll(
          { where: { id: id } , 
            attributes:['name']}
        )
        console.log(result.count);
        } catch (error){ console.log(error)};

        
        //return result;
      }

      
      async joinFind(id: string): Promise<payment[]> {
        let payment = await this.paymentModel.findAndCountAll({ 
          include: [refund],
          where: {id: id}})
        
        payment.count;
        let result = payment.rows;
        return result;
      }

      findElse(id: string): void {
        let result = new payment();
        this.paymentModel.findOne(
          { where: { id: id } }
        ).then(async (payment) => {
          payment.name = '222';
          result  = await payment.save();
        });
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
      //  const user = await this.findOne(id);
      //  await user.destroy(); //삭제 
      }
     async create(): Promise<void> {
      try {

       //transaction 
        let payment = { name: 'test', account:400, total:6500} ;
        const result = await this.sequelize.transaction(async (t) => {
          //row query  
          this.sequelize.query("select * from test  WHERE id in (1,2,3)", {transaction: t}).then(([results, metadata]) => {
            results.forEach( data=> {} );
          })

          let paymentResult = await this.paymentModel.create(payment, { transaction: t });
          await this.refundModel.create({
             paymentId: paymentResult.id,
             refundName: 'join', account:400, total:6500
           }, {transaction: t})
           //정상처리 

        });
    } catch(error) {
      console.log('error');
    }
    }

    createRefund(): Promise<refund> {
      let payment = { refundName: 'test', account:400, total:6500, paymentId: 2} 
      return this.refundModel.create(payment);
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

