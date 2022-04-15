import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectRepository } from '@nestjs/typeorm';
import { payment } from './payment.entity';
import { PaymentRepository } from './payment.repository';
@Injectable()
export class PaymentService {
//@types/sequelize 사용  app.module에서 주소 설정함 
    constructor(
        @InjectModel(payment)
        private readonly paymentModel: typeof payment,
      ) {}

      async findAll(): Promise<payment[]> {
        return this.paymentModel.findAll();
      }
    
      findOne(id: string): Promise<payment> {
        return this.paymentModel.findOne({
          where: {
            id,
          },
        });
      }
    
      async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await user.destroy();
      }
    //  create(createUserDto: CreateUserDto): Promise<Uspaymenter> {
    //     return this.userModel.create(createUserDto);
    // }
}
