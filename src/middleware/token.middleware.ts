import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/winston';
import jwt_decode from "jwt-decode";
const jwt = require('jsonwebtoken');
axios.defaults.baseURL = `${process.env.REACT_APP_TICKET_API_URL}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';
let jwtObj = {secret: 'MFVGv2c2iT4yoT!zW9!wksoD'};


//front의 쿠키에서 token, refreshToken 
@Injectable()
export class TokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      res.set({'Access-Control-Allow-Origin':  req.header('Origin')});
      res.set({'Access-Control-Allow-Credentials' : 'true'});
      res.set({'ccess-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS'})
      res.set({'Access-Control-Allow-Headers' : 'X-PINGOTHER, Content-Type'})
      //token, refreshToken
      let {token, refreshToken} = req.cookies;
      let param = {};
       //jwt 유효성 체크 
       jwt.verify(token, `${jwtObj.secret}`, function(err, decoded) {
         if(err) {
          return res.json({statusCode:401, message:'token'});
         } else {
           console.log(decoded);
         let { idx, 
              username, //id
              name} = decoded;
          param = {uid: idx,
                  userName: username}
          }
       });
      //토근으로 uid 셋팅 
      if (req.method === 'GET') {
        req.query = {...req.query, ...param};
      } else if (req.method === 'POST') {
        req.body = {...req.body, ...param};
      }
      
    } catch(error) {
      logger.warn(error);
      logger.warn('[Token middleware] parsing error');
      return res.json({statusCode:401, message:'token'});
    }
      next();
  }
}



/*
import axios from 'axios';

axios.defaults.baseURL = `${process.env.REACT_APP_TICKET_API_URL}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';

let token = {
  accessToken: '',
  refreshToken: ''
}

export const init = async (accessToken, refreshToken, setCookie, removeCookie) => {
  updateToken(accessToken, refreshToken);

  axios.interceptors.request.use((config) => {
    config.headers['Authorization'] = `Bearer ${token.accessToken}`;
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Headers'] = '*';

    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';

    return config;
  }, err => {
    console.error(err);
    Promise.reject(err);
  });

  axios.interceptors.response.use(response => {
    return response;
  }, err => {
    const response = err.response;
    return new Promise((resolve, reject) => {
      // Do refresh Token
      if (response.status === 401) {
        console.log('do refresh token');
        let config = response.config;
        let headers = config.headers;
        console.log(config);

        const refreshRequest = axios.create({
          baseURL: `${process.env.REACT_APP_AUTH_API_URL}`,
          headers
        });
        return refreshRequest.post('/refresh', {
          refreshToken: token.refreshToken
        }).then(({ status, data }) => {
          if (status === 200) {
            console.log('get new token')

            setCookie('token', data.token, {
              domain: process.env.REACT_APP_DOMAIN,
              path: '/'
            });
            setCookie('refreshToken', data.refreshToken, {
              domain: process.env.REACT_APP_DOMAIN,
              path: '/'
            });
            updateToken(data.token, data.refreshToken);
            headers['Authorization'] = `Bearer ${data.token}`;

            if (window.flutter_inappwebview) {
              window.flutter_inappwebview.callHandler('refresh', data.token, data.refreshToken);
            }

            const retryAxios = axios.create({ headers });
            if (config.method === 'get') {
              return retryAxios.get(config.url)
            } else if (config.method === 'post') {
              return retryAxios.post(config.url, config.data);
            } else if (config.method === 'patch') {
              return retryAxios.patch(config.url, config.data);
            } else if (config.method === 'put') {
              return retryAxios.put(config.url, config.data);
            } else if (config.method === 'delete') {
              return retryAxios.delete(config.url, { data: config.data });
            }
          } else {
            if (status === 401) {
              if (window.flutter_inappwebview) {
                window.flutter_inappwebview.callHandler('logout');
              }
            }

            resolve(status);
          }
        })
        .then(result => {
          console.log('result', result);
          resolve(result);
        })
        .catch(_ => {
          removeCookie('token');
          removeCookie('refreshToken');
          console.log('axios response interceptor error!!!')
          if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('logout');
          } else {
            window.location.href = '/login';
          }
          resolve(response);
        });
      } else {
        resolve(response);
      }
    });
  });
}

export const updateToken = (accessToken, refreshToken) => {
  token.accessToken = accessToken;
  token.refreshToken = refreshToken;
}
*/