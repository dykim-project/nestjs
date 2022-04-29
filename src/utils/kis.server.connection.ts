import axios from 'axios';
import { logger } from 'src/config/winston';
export const kisServerCon = async (url:string, data: any):Promise<any> => {
    try {
        const server = 'https://orderapi.kisvan.co.kr';
        data = {
            chnlId: 'CH00000334',
            ...data
        };
        let requestUrl = server + url; 
        logger.log(requestUrl);
        logger.log(data);
        const result = await axios
        .post(requestUrl, {
            data:JSON.stringify(data),
            headers: {
            Accept: "application/json",
            "APP-ID": "hanwhaeagles_order",
            "CHNL-ID": "CH00002034",
            "CLIENT-ID": "oAAjZOwpRT/xJGHe4gTYr7spTIF9RgfxOhESwOBdln84L68D1PLfeH+hj9lXlmEZ",
            "Authorization": "Bearer a01-c2da3c78-56db-11ea-89eb-005056a1136b"
            },
        });
        return result;
    } catch (error) {
        logger.error(`[KIS SERVER ERROR] ${error.response.data.errorMsg}`);
        return error.response;
    } 
    //.then(({data}) => {
        //console.log(data);
        //성공
        //if($authResultCode === "0000"){
            //리턴 파라미터들 
            /* $authResultCode = $_POST['AuthResultCode'];		// 인증결과 : 0000(성공)
            $authResultMsg = $_POST['AuthResultMsg'];		// 인증결과 메시지
            $nextAppURL = $_POST['NextAppURL'];				// 승인 요청 URL
            $tid = $_POST['TxTid'];						// 거래 ID
            $authToken = $_POST['AuthToken'];				// 인증 TOKEN
            $payMethod = $_POST['PayMethod'];				// 결제수단
            $mid = $_POST['MID'];							// 상점 아이디
            $moid = $_POST['Moid'];							// 상점 주문번호
            $amt = $_POST['Amt'];							// 결제 금액
            $orderId = $_POST['ReqReserved'];			// 주문ID
            $netCancelURL = $_POST['NetCancelURL'];			// 망취소 요청 URL*/
        //} else {
            //실패
        //}
    //     return data;
    // }).catch(Error=> {
    //     logger.error(Error.response.data);
    //     logger.error(Error.response.data.errorMsg);
    //     return Error.response.data;
    // }) ;
}