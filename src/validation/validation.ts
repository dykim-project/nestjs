import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ObjectSchema } from 'joi';
import { logger } from "src/config/winston";
@Injectable()
export class ValidationPipe implements PipeTransform {
    //ArgumentMetadata 'body' | 'query' | 'param' | 'custom';
    constructor(private schema: ObjectSchema) {}
    transform(value: any, metadata: ArgumentMetadata) {

    const { error } = this.schema.validate(value);
    console.log(error.details[0]['message']);
    if (error) {
      logger.error(error.details[0]['message']);
      throw new BadRequestException('잘못된 요청입니다.');
    }
    return value;
  }
}