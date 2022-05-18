import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { NcpayDto } from 'src/dto/ncPayDto';
import { logger } from 'src/config/winston';
import { common } from '../../utils/common';
const bcrypt = require('bcryptjs');
import axios,{Method} from 'axios';
import e, { Response } from 'express';
import { PaymentService } from '../payment/payment.service';
import { nicepayNetcancel } from 'src/utils/nicepay.netcancel';
import { CartService } from '../cart/cart.service';
const iconv = require('iconv-lite');
const Sequelize = require('sequelize');
const config  = require('../../config/config');

@Injectable()
export class NcpayService {
  constructor(
    @InjectConnection('accountdb')   
    private sequelize: typeof Sequelize,

    @InjectConnection()   
    private mdSequelize: typeof Sequelize,
    
    private readonly paymentService: PaymentService,
    private readonly cartService: CartService
  ) {}
  
  async getNcPay(userIdx: number) {
      try {
        // NC 다이노스 페이
        const [ncPays] = await this.sequelize.query(`SELECT id, cardName FROM ncPay WHERE userIdx =${userIdx}`);
        
        return {ncPays}
      } catch (err) {
        common.logger({}, '[NcpayService.getNcPay]');
        common.errorException(502, 'GET_NCPAY_FAIL', {});
      }
    
  }

  //requestNcPayPayment 참고
  async payNcpay(ncpayDto: NcpayDto, res: Response): Promise<any> {
    try {
      const [ncpayResult] = await this.sequelize.query(`select * from ncPay where userIdx=${ncpayDto.uid} and id=${ncpayDto.ncPayId}`
      ,{ type: this.sequelize.QueryTypes.SELECT});
      if (!ncpayResult) {
        return res.json({statusCode:204, resultMsg: '카드 정보를 확인할 수 없습니다.'});
      }

    
      const savedPoint = ncpayDto.amt * 0.01;

      let dt = common.getYYYYMMDDHHMMSS();
      dt = dt.substr(2,dt.length-1);
      const [tidSequence] =  await this.sequelize.query(`
        INSERT INTO tidSequence (dt, seq)
        VALUES(${dt}, LAST_INSERT_ID(0))
        ON DUPLICATE KEY UPDATE seq = LAST_INSERT_ID(seq + 1)
      `);
      const moid = 'F' + common.getYYMMDD() + (ncpayDto.orderId).slice(-10);
      let tid = `${config.NicepayBillingMid}0116${dt}${('0000' + tidSequence).slice(-4)}`;
      logger.info('tid:::::::::' + tid);
      const ediDate = common.getYYYYMMDDHHMMSS();
      let envalue = config.NicepayBillingMid + ediDate + moid + ncpayDto.amt + ncpayResult.bid + config.NicepayBillingMkey;
      const signData = common.getSignData(envalue);

      let data = {
        BID: ncpayResult.bid,
        MID: config.NicepayBillingMid,
        TID: tid,
        EdiDate: ediDate,
        Moid: moid,
        Amt: ncpayDto.amt,
        GoodsName: ncpayDto.GoodsName,
        SignData: signData,
        CardInterest: '0',
        CardQuota: '00',
        BuyerName: ncpayDto.name,
        BuyerEmail: ncpayDto.email,
        BuyerTel: ncpayDto.userTel,
        CharSet: 'utf-8'
      }
      console.log(data);
      var options = {
        url: 'https://webapi.nicepay.co.kr/webapi/billing/billing_approve.jsp',
        headers: {
            'User-Agent': 'Super Agent/0.0.1',
            'Content-Type': 'application/x-www-form-urlencoded;  charset=EUC-KR'
        },
      params: {...data}  
      }
      const response = await axios.request( options );

      if (response.status !== 200) {
        return res.json({statusCode:204, resultMsg:'결제 요청을 실패했습니다.'});
      } else if (response.data.ResultCode !== '3001') {
        res.json({statusCode:204, resultMsg:response.data.ResultMsg })
      }
      //
      logger.info("성공::::::::::::::::::::::::::::::::::::::::::::::::");
      logger.info('TID:' + response.data.TID);
      logger.info('Moid' + response.data.Moid);
      console.log(response.data);
        const orderWithPgData = {
          Moid: ncpayDto.orderId, 
          MID:config.NicepayBillingMid, 
          TID:response.data.TID,
          AuthCode: response.data.AuthCode,
          CardCode: response.data.CardCode,
          CardName: response.data.CardName,
        };    
        console.log('orderWithPg ncpay::::');
        console.log(orderWithPgData);
        const orderWithPg = await this.paymentService.orderWithPg(orderWithPgData);
        // //실패인경우 결제 취소 
        logger.info('orderWithPg:::::');
        logger.info(orderWithPg);
      // orderWithPg.rst == 0
      if(!orderWithPg ) {
        const ediDate = common.getYYYYMMDDHHMMSS();
        let envalue = config.NicepayBillingMid + ncpayDto.amt + ediDate + config.NicepayBillingMkey;
        const signData = common.getSignData(envalue);
        let cancelBody = {
          TID: tid,
          MID: config.NicepayBillingMid,
          Moid: moid,
          CancelAmt: ncpayDto.amt,
          CancelMsg: '스마트 오더 오류',
          PartialCancelCode: '0',
          EdiDate: ediDate,
          SignData: signData,
          CharSet: 'utf-8',
        }
        const cancelResult = await nicepayNetcancel(cancelBody);  
        if(cancelResult.data.ResultCode === '2001') {
          await this.paymentService.updateOrderStatus(moid, 'EC9999');
        }
        logger.info('cancel result:::::::::::::');
        logger.info(cancelResult.data);
        console.log(cancelResult.data);
        return {statusCode:204, resultMsg:'결제 중 에러가 발생했습니다.[스마트 오더 오류]'}
      } else {
        console.log(response.data);
        response.data.orderId = ncpayDto.orderId;
        await this.paymentService.authUpdate(response.data);
        await this.paymentService.updateOrderStatus(response.data.Moid, '1001');
        await this.cartService.deleteAllCart(ncpayDto.uid);
        
        //쿠폰및 포인트 차감 
        //uid, couponIdx, usercouponidx, shopcode 
        if(ncpayDto.couponIdx > 0 || ncpayDto.point > 0 ) { 
          let updateResult = false;
          if(ncpayDto.couponIdx > 0) { 
            updateResult = await this.paymentService.saveCouponHistory(ncpayDto.couponIdx,ncpayDto.orderId);
          }
          if(ncpayDto.point > 0) {
            let pointData = {
              orderId: ncpayDto.orderId,
              point: ncpayDto.point,
              storeId: ncpayDto.storeId,
              uid: ncpayDto.uid
            }
            updateResult = await this.paymentService.savePointHistory(pointData);
          }
          if(updateResult) {
            return {statusCode:200}
          } else {
            logger.info('결제 완료 : 쿠폰, 포인트 차감 오류 ');
            return {statusCode:204, resultMsg:'결제 완료 : 쿠폰, 포인트 차감 오류'}
          }
        }
        
       
      }
    } catch (error) {
      logger.info('ncpay payment error');
      logger.info(error);
      return {statusCode:204, resultMsg:'결제 중 에러가 발생했습니다.'}
    }
  }

  //취소테스트 =======================================================================================
  async cancelNcpay() {


    // F2205180001496357	ddfactor7m01162205181611030000 500
    // F2205180001496347	ddfactor7m01162205181549170000 //2000
    // F2205180001496316	ddfactor7m01162205181512250000  900.0
    // F2205180001496303	ddfactor7m01162205181457160000 //1500
    // F2205180001496306	ddfactor7m01162205181500310000 // 900
    //F2205180001496277	ddfactor7m01162205181436180000
    let arry = [{moid:'F2205180001496277', tid:'ddfactor7m01162205181436180000', price:1000},
  //  {moid:'F2205180001496303', tid:'ddfactor7m01162205181457160000', price: 1500},
  //  {moid:'F2205180001496357', tid:'ddfactor7m01162205181611030000', price: 500},

  ];
    arry.forEach(async data => {
      await this.cancelProcess(data);
    })
  }


  async cancelProcess(obj: {tid:string, moid:string, price:number}) {
    const ediDate = common.getYYYYMMDDHHMMSS();
    //const price = 1000;
    let envalue = config.NicepayBillingMid + obj.price + ediDate + config.NicepayBillingMkey;

    const signData = common.getSignData(envalue);
    let cancelBody = {
      TID: obj.tid,
      MID: config.NicepayBillingMid,
      Moid: obj.moid, //00000001496240
      CancelAmt: obj.price,
      CancelMsg: '스마트 오더 오류',
      PartialCancelCode: '0',
      EdiDate: ediDate,
      SignData: signData,
      CharSet: 'utf-8',
    } //00000001496224
    const cancelResult = await nicepayNetcancel(cancelBody);  
    console.log('cancel result: ncpay::::::::::::');
    console.log(cancelResult.data);
    if(cancelResult.status) {
      if(cancelResult.data.ResultCode === '2001'){
        //취소 성공 
        await this.paymentService.updateOrderStatus(cancelResult.data.Moid, 'EC9999');
      }
    }
  }
}

