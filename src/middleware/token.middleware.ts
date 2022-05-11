import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/winston';
import jwt_decode from "jwt-decode";
import { timestamp } from 'rxjs';
const jwt = require('jsonwebtoken');
const config = require('../config/config');
let jwtObj = {secret: config.JWT_SECRET};


const tokenChk = async (token) => {
  axios.defaults.baseURL = `${config.REACT_APP_API_URL}`;
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.interceptors.request.use((config) => {
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Headers'] = '*';

    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';

    return config;
  }, err => {
    console.error(err);
    Promise.reject(err);
  });

  await axios.interceptors.response.use(response => {
    return response;
  });
}
//front의 쿠키에서 token, refreshToken 
@Injectable()
export class TokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.set({'Access-Control-Allow-Origin':  req.header('Origin')});
    res.set({'Access-Control-Allow-Credentials' : 'true'});
    res.set({'ccess-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS'})
    res.set({'Access-Control-Allow-Headers' : 'X-PINGOTHER, Content-Type'})
    if(req.url == '/payment/resultNicePay') {
     return next();
    }
    try {
     
      //token, refreshToken
      let {token, refreshToken} = req.cookies;
      let param = {};
      //토큰 유효성 체크 
      logger.info(token);
       //jwt 값 얻기 
       jwt.verify(token, `${jwtObj.secret}`, function(err, decoded) {
         if(err) {
          return res.json({statusCode:401, message:'token'});
         } else {
           console.log(decoded);
         let { idx, 
              username, //id
              name,
              email
              } = decoded.member;
          param = {uid: idx,
                  userId: username,
                  userName: name,
                  email}
          }
       });
      //토근으로 uid 셋팅
      if (req.method === 'GET') {
        req.query = {...req.query, ...param};
      } else if (req.method === 'POST') {
        req.body = {...req.body, ...param};
      }
      console.log(req.query);
    } catch(error) {
      logger.warn(error);
      logger.warn('[Token middleware] parsing error');
      return res.json({statusCode:401, message:'token'});
    }
      next();
  }
}


