import { Module } from '@nestjs/common';
import { SampleService } from './sample.service';
import { SampleController } from './sample.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { sample } from '../entity/sample.entity';
import { sample2 } from '../entity/sample2.entity';
@Module({
  imports: [SequelizeModule.forFeature([sample])
 ], 
  providers: [SampleService],
  controllers: [SampleController]
})
export class SampleModule {}
