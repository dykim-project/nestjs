import { Product } from './entity/product.entity';

export const productsProviders = [
  {
    provide: 'PRODUCT_REPOSITORY',
    useValue: Product,
  },
];