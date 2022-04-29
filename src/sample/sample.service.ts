import { Inject, Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Response } from 'express';
import { sample } from '../entity/sample.entity';
import { sample2 } from '../entity/sample2.entity';
import { Sequelize } from 'sequelize';
import { logger } from 'src/config/winston';
import axios from 'axios';

@Injectable()
export class SampleService {
    constructor(
        @InjectModel(sample)
        private sampleModel: typeof sample,

        //@InjectModel(sample2, 'mddb')
        //private productModel: typeof sample2,

        @InjectConnection()
        private sequelize: Sequelize,

        // @InjectConnection('mddb')
        // private sequelizeMd: Sequelize,
      ) {}

      async findAll(): Promise<sample[]> {
        return this.sampleModel.findAll();
      }

      // async productAll(): Promise<sample2[]> {
      //   try {
      //     return this.productModel.findAll();
      //   } catch(error) {
      //     console.log(error);
      //   }
      // }



      //가져올 컬럼 선택하기
      async findOne(id: number): Promise<void> {
        try {
        const result = await this.sampleModel.findAndCountAll(
          { where: { id: id } , 
            attributes:['name']}
        )
        } catch (error){ logger.warn(error);};

        
      }

      //pk로만 검색하기 
      async findOne2(id:number): Promise<void> {
        try {
          const result = await this.sampleModel.findByPk(id);
          console.log(result.toJSON);
        } catch(error) {

        }
      }

      //검색 후 없으면 create 
      async findAndCreate(name: string): Promise<void> {
        try {
          const [sample, created] = await this.sampleModel.findOrCreate({
            where: { name: name },
            defaults: {
              account: 100000, total:2000000
            }
          });
          console.log(sample.toJSON());
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
       async joinFind(id: string): Promise<sample[]> {
         let sample = await this.sampleModel.findAndCountAll({ 
           include: [sample2],
           where: {id: id}})
         let result = sample.rows;
         return result;
      }

      //join 
    //   async joinFind2(id: string): Promise<sample[]> {
    //     try { 
    //       return await this.sampleModel.findAll({
    //       include:{
    //         model: refund,
    //         where: {
    //          id: 4
    //         },
    //       },
    //       where:  {id: id}
    //   });
    //   } catch(error){
    //     logger.warn(error);
    //   }
    // } 

      //update
      findElse(id: string): void {
        let result = new sample();
        this.sampleModel.findOne(
          { where: { id: id } }
        ).then(async (sample) => {
          //sample.name = '222';
          result  = await sample.save();
        });
      }
    
     // async manyTo(): Promise<sample[]> {
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
        let sample2 = { name: 'test', account:400, total:6500} ;
        const result = await this.sequelize.transaction(async (t) => {
          //row query  
          let [result] = await this.sequelize.query("select * from test  WHERE id in (1,2,3)", {
            transaction: t  });

          let sampleResult = await this.sampleModel.create(sample2, { transaction: t });

        });
      } catch(error) {
        console.log('error');
      }
    }

    update(res: Response): void{
      this.sampleModel.update(
        {
          name: 'bobby',
        },
        { where: { id: 1 } }
      ).then(() => { return res.json({"status": 200, "message": "success"}) })
    }

    async ajaxTest() {
      try { 
        const url = '';
        const data = {
        a: 10,
        b: 20,
        };
        axios
        .post(url, data, {
            timeout: 15, 
            headers: {
            Accept: "application/json",
            
            },
        })
        .then(({data}) => {
           
        });
    } catch(error) { 
        logger.error('[payment.nicepayAuth]');
        logger.error(error);
 }
    } 
}

