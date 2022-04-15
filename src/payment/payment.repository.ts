import { EntityRepository, Repository } from 'typeorm';
import { payment } from './payment.entity';

@EntityRepository(payment)
export class PaymentRepository extends Repository<payment> {

}