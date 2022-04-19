import { Inject, Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Response } from 'express';
import { payment } from '../entity/payment.entity';
import { refund } from '../entity/refund.entity';
import { QueryTypes, Sequelize } from 'sequelize';
import { logger } from 'src/config/winston';
import { ProductDto } from '../dto/productDto';
import { product } from 'src/entity/product.entity';
@Injectable()
export class PaymentService {
    constructor(
        @InjectModel(payment)
        private paymentModel: typeof payment,

        @InjectModel(refund)
        private refundModel: typeof refund,

        @InjectModel(product, 'mddb')
        private productModel: typeof product,

        @InjectConnection()
        private sequelize: Sequelize,
      ) {}

      async findAll(): Promise<payment[]> {
        return this.paymentModel.findAll();
      }

      async productAll(): Promise<product[]> {
        try {
          return this.productModel.findAll();
        } catch(error) {
          console.log(error);
        }
      }



      //가져올 컬럼 선택하기
      async findOne(id: number): Promise<void> {
        try {
        const result = await this.paymentModel.findAndCountAll(
          { where: { id: id } , 
            attributes:['name']}
        )
        } catch (error){ logger.warn(error);};

        
      }

      //pk로만 검색하기 
      async findOne2(id:number): Promise<void> {
        try {
          const result = await this.paymentModel.findByPk(id);
          console.log(result.toJSON);
        } catch(error) {

        }
      }

      //검색 후 없으면 create 
      async findAndCreate(name: string): Promise<void> {
        try {
          const [payment, created] = await this.paymentModel.findOrCreate({
            where: { name: name },
            defaults: {
              account: 100000, total:2000000
            }
          });
          console.log(payment.toJSON());
          if (created) {
          logger.info('created');
          logger.info(created);
            // console.log(user.job); // This will certainly be 'Technical Lead JavaScript'
          }
        } catch(error) {
          console.log(error);
        }
      }
      
      //join
      async joinFind(id: string): Promise<payment[]> {
        let payment = await this.paymentModel.findAndCountAll({ 
          include: [refund],
          where: {id: id}})
        let result = payment.rows;
        return result;
      }

      //join 
      async joinFind2(id: string): Promise<payment[]> {
        try { 
          return await this.paymentModel.findAll({
          include:{
            model: refund,
            where: {
             id: 4
            },
          },
          where:  {id: id}
      });
      } catch(error){
        logger.warn(error);
      }
    } 

      //update
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
        let payment2 = { name: 'test', account:400, total:6500} ;
        const result = await this.sequelize.transaction(async (t) => {
          //row query  
          let [result] = await this.sequelize.query("select * from test  WHERE id in (1,2,3)", {
            transaction: t  });

          let paymentResult = await this.paymentModel.create(payment2, { transaction: t });
          await this.refundModel.create({
             paymentId: paymentResult.id,
             refundName: 'join', account:400, total:6500
           }, {transaction: t})

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

