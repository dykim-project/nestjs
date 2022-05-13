import axios from 'axios';
import { logger } from 'src/config/winston';
import { ProcessException } from 'src/exception/process.exception';
const config  = require('../config/config');

export const kisServerCon = async (url:string, data?: any):Promise<any> => {
    const instance = axios.create({
      });

    try {
        const server = 'https://orderapi.kisvan.co.kr'; //'http://61.40.211.38:8081'
        data = {
            chnlId: config.channelID,
            ...data
        };
        let requestUrl = server + url; 
        logger.info(requestUrl);
        logger.info(JSON.stringify(data));
        const headers = {
            "Accept": "application/json",
            "APP-ID": "hanwhaeagles_order",
            "CHNL-ID": config.channelID,
            "CLIENT-ID": "oAAjZOwpRT/xJGHe4gTYr7spTIF9RgfxOhESwOBdln84L68D1PLfeH+hj9lXlmEZ",
            "Authorization": "Bearer a01-c2da3c78-56db-11ea-89eb-005056a1136b"
            };
        const result = await instance
        .post(requestUrl, 
           {body: data},
           {headers: headers}
        );
        return result;
    } catch (error) {
        logger.error(`[KIS SERVER ERROR] ${error.response?.data?.errorMsg}`);
        console.log(error.response);
        throw new ProcessException(error, "kisserver ");
    } 
    
}