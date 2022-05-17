import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { NcpayDto } from 'src/dto/ncPayDto';
import { logger } from 'src/config/winston';
import { common } from '../../utils/common';
const bcrypt = require('bcryptjs');
import axios,{Method} from 'axios';
import { Response } from 'express';
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
  
  async getNcPay(userIdx: string) {
      try {
        //name, phone, email, point
        const [userInfo] = await this.sequelize.query(`SELECT name, phone, email, point FROM user WHERE idx =${userIdx}`, { type: this.sequelize.QueryTypes.SELECT});
        const [coupons] = await this.sequelize.query(`SELECT userCoupon.idx, coupon.couponName, coupon.couponDesc, coupon.discountType, coupon.discountAmount, coupon.maxDiscount
        FROM userCoupon
        JOIN coupon ON userCoupon.couponIdx=coupon.idx
        WHERE userCoupon.userIdx=${userIdx} AND userCoupon.isUsed='N' AND coupon.usableTicket=1 AND coupon.startDate<=Date(NOW()) AND coupon.endDate>=DATE(NOW())`);
        console.log('coupon::::::::::::::');
        console.log(coupons);
    
        // NC 다이노스 페이
        const [ncPays] = await this.sequelize.query(`SELECT id, cardName FROM ncPay WHERE userIdx =${userIdx}`);
        
        return {userInfo, coupons, ncPays}
      } catch (err) {
        common.logger({}, '[NcpayService.getNcPay]');
        common.errorException(502, 'GET_NCPAY_FAIL', {});
      }
    
  }

  //requestNcPayPayment 참고
  async payNcpay(ncpayDto: NcpayDto, res: Response): Promise<any> {
    try {
    
      //비밀번호 체크 
      const [payPwd] = await this.sequelize.query(`select payPwd from ncPay where id=${ncpayDto.ncPayId}`,{ type: this.sequelize.QueryTypes.SELECT});
      const pwd = payPwd.payPwd;
      //  if (!bcrypt.compareSync(pwd, ncpayDto.payPwd)) {
      //     res.json({statusCode:204, resultMsg:'PWD_FALSE'})
      //  }
      //------------------------------------------------------------
      const [ncpayResult] = await this.sequelize.query(`select * from ncPay where userIdx=${ncpayDto.uid} and id=${ncpayDto.ncPayId}`
      ,{ type: this.sequelize.QueryTypes.SELECT});
      if (!ncpayResult) {
        return res.json({statusCode:204, resultMsg: '카드 정보를 확인할 수 없습니다.'});
      }

    
      const savedPoint = ncpayDto.amt * 0.01;

      let dt = common.getYYYYMMDDHHMMSS();//format.asString('yyMMddhhmmss', now);
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
    console.log("성공::::::::::::::::::::::::::::::::::::::::::::::::");
    console.log(response.data);
    // {
    //   ResultCode: '3001',
    //   ResultMsg: '카드 결제 성공',
    //   AuthCode: '46628448',
    //   AuthDate: '220517133844',
    //   AcquCardCode: '04',
    //   AcquCardName: '삼성',
    //   CardCode: '04',
    //   CardName: '삼성',
    //   CardQuota: '00',
    //   CardInterest: '0',
    //   CardCl: '0',
    //   Amt: '000000000500',
    //   Moid: 'F2205170001494174',
    //   TID: 'ddfactor7m01162205171338440000',
    //   GoodsName: '상품명 테스트',
    //   MID: 'ddfactor7m',
    //   BuyerName: '김김김',
    //   CcPartCl: '1',
    //   MallReserved: '',
    //   CardNo: '53664800****4472'
    // }

    //결제 성공후 다음 kis server 진행 
  //스마트오더 결제상태 변경 
      const orderWithPgData = {ordrId: moid, 
        pgMID:config.NicepayBillingMid, 
        pgTrId:tid,
        pgAuthNo: response.data.AuthCode,
        cardIssueCorpNo: response.data.CardCode,
        cardIssueCorpNm: response.data.CardName
      };    
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
      logger.info(cancelResult);
      return res.send({
        body: `<html><script>alert('결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다 '); window.location.replace('${config.frontServer}/storeList') </script></html>`
      })
    } else {
      console.log(response.data);
      this.paymentService.authUpdate(response.data);
      this.paymentService.updateOrderStatus(response.data.Moid, '1001');
      //uid 
      this.cartService.deleteAllCart(ncpayDto.uid);
    }
  //===============================================================================

    } catch (error) {
      logger.info('ncpay payment error');
      logger.info(error);
      return res.send({
        body: `<html><script>alert('결제 중 에러가 발생했습니다.\n메인화면으로 이동합니다 '); window.location.replace('${config.frontServer}/storeList') </script></html>`
    })
    }
  }








  //취소테스트 
  async cancelNcpay() {
    const ediDate = common.getYYYYMMDDHHMMSS();
    let envalue = config.NicepayBillingMid + 500 + ediDate + config.NicepayBillingMkey;

    const signData = common.getSignData(envalue);
    let cancelBody = {
      TID: 'ddfactor7m01162205171148250000',
      MID: config.NicepayBillingMid,
      Moid: 'F2205170001494174',
      CancelAmt: 500,
      CancelMsg: '스마트 오더 오류',
      PartialCancelCode: '0',
      EdiDate: ediDate,
      SignData: signData,
      CharSet: 'utf-8',
    }
    const cancelResult = await nicepayNetcancel(cancelBody);  
    console.log('cancel result:::::::::::::');
    console.log(cancelResult);
    if(cancelResult.status) {
      if(cancelResult.data.ResultCode === '2001'){
        //취소 성공 
        await this.paymentService.updateOrderStatus('orderId', 'EC9999');
      }
    }
    // ResultCode: '2001',
    // ResultMsg: '취소 성공',
    // ErrorCD: '0000',
    // ErrorMsg: '승    인',
    // CancelAmt: '000000000500',
    // MID: 'ddfactor7m',
    // Moid: 'F2205170001494174',
    // PayMethod: 'CARD',
    // TID: 'ddfactor7m01162205171148250000',
    // CancelDate: '20220517',
    // CancelTime: '132621',
    // CancelNum: '00388715',
    // RemainAmt: '000000000000',
    // Signature: '9933761bb8ff3508f9e86f2a07b97561b2198ccd4e4d9cefd3e2eb0a4cc955fc',
    // MallReserved: '',
    // CouponAmt: '000000000000',
    // ClickpayCl: '',
    // MultiCardAcquAmt: '',
    // MultiPointAmt: '',
    // MultiCouponAmt: ''
  }

}

