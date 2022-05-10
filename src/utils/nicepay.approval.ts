import axios,{Method} from 'axios';
import { AnyMxRecord } from 'dns';
import { Response } from 'express';
import { logger } from 'src/config/winston';


export const nicepayApproval  = async (requestUrl:string, data: any, res: Response):Promise<any> => {
    var options = {
        url: requestUrl,
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

    
