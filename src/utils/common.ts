import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { logger } from 'src/config/winston';
const CryptoJS = require("crypto-js");

export const common = {
    errorException (code, message, error) {
        const data = {statusCode: code, resultMessage: message}
        error = {...error, ...data};
        console.log('res error:::::::::::::');
        //throw new BadRequestException(error);
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
    },
    getYYYYMMDDHHMMSS() {
        const date = new Date();
        const year:string = date.getFullYear().toString();
        const month:string = ("0" + (date.getMonth() + 1)).slice(-2);
        const day:string = ("0" + date.getDate()).slice(-2);
        const hour:string = ("0" + date.getHours()).slice(-2);
        const min:string = ("0" + date.getMinutes()).slice(-2);
        const sec:string =  ("0" + date.getSeconds()).slice(-2);
        return year + month + day + hour + min +sec;
    },
    getYYMMDD() {
        const date = new Date();
        const year:string = date.getFullYear().toString().substr(2,5);
        const month:string = ("0" + (date.getMonth() + 1)).slice(-2);
        const day:string = ("0" + date.getDate()).slice(-2);
        return year + month + day;
    }
    , getSignData(str) {
        var encrypted = CryptoJS.SHA256(str);
        return encrypted.toString();
    }
    
}