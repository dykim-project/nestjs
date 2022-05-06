import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/winston';
const jwt = require('jsonwebtoken');
axios.defaults.baseURL = `${process.env.REACT_APP_TICKET_API_URL}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';
let jwtObj = {secret: process.env.JWT_SECRET};


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
      let {token, uid} = req.cookies;
      uid = 1112;
      console.log(req.cookies);
      console.log('get' + uid);
      let param = {uid: uid,
                  userName:'temp'};
      if (req.method === 'GET') {
        console.log('get::::::::::');
        req.query = {...req.query, ...param};
      } else if (req.method === 'POST') {
        console.log('post::::::::::::::');
        req.body = {...req.body, ...param};
        console.log(req.body);
      }
      console.log('token====================');
      console.log(param);
      //jwt 유효성 체크 
      //console.log(process.env.JWT_SECRET);
      //let decoded = jwt.verify(token, `${jwtObj.secret}`);
      //토큰값
      
        //decrypt
    } catch(error) {
      logger.warn(error);
      logger.warn('[Token middleware] parsing error');
      return res.json({statusCode:401, message:'token'});
      //res.. 
       //throw new BadRequestException();
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