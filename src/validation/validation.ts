import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { ObjectSchema } from 'joi';
import { logger } from "src/config/winston";
import { BadRequestException } from "src/exception/request.exception";
@Injectable()
export class ValidationPipe implements PipeTransform {
    //ArgumentMetadata 'body' | 'query' | 'param' | 'custom';
    constructor(private schema: ObjectSchema) {}
    transform(value: any, metadata: ArgumentMetadata) {

    const { error } = this.schema.validate(value);
    if (error) {
      logger.error(error.details[0]['message']);
      throw new BadRequestException();
    }
    return value;
  }
}