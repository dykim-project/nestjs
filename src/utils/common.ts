import { InternalServerErrorException } from '@nestjs/common';
import { logger } from 'src/config/winston';

export const common = {
    errorException (code, message, error) {
        const data = {statusCode: code, resultMessage: message}
        error = {...error, ...data};
        throw new InternalServerErrorException(error);
    },
    logger (error, methodName) {
        logger.error(methodName);
        logger.error(error);
    }
}