import axios,{Method} from 'axios';
import { logger } from 'src/config/winston';
const iconv = require('iconv-lite');

export const nicepayNetcancel  = async ( data: any):Promise<any> => {
    data = {...DataTransfer, ...{CancelMsg: iconv("UTF-8", "EUC-KR", data.CancelMsg)}}
    var options = {
        url: 'https://webapi.nicepay.co.kr/webapi/cancel_process.jsp',
        //method: 'POST',
        headers: {
            'User-Agent': 'Super Agent/0.0.1',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
       // encoding: null,
       params: {...data}  
    }

    const result= await axios.request( options );
    return result;
}

    
