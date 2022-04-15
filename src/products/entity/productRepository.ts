import { EntityRepository, Repository } from 'typeorm';
import { product } from './product.entity';

@EntityRepository(product)
export class ProductRepository extends Repository<product> {

}