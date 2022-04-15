import { Sequelize } from 'sequelize-typescript';
import { Product } from '../products/entity/product.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: '211.216.48.159',
        port: 3307,
        username: 'ddfactory',
        password: 'ddfactory!@',
        database: 'test',
      });
      sequelize.addModels([Product]);
      await sequelize.sync();
      return sequelize;
    },
  },
];