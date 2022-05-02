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
    },
    getInputDayLabel() {
        var week = new Array(0,1,2,3,4,5,6);
        var today = new Date().getDay();
        var todayLabel = week[today];
        
        return todayLabel;
    }
    
}