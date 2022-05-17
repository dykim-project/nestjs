
if(process.env.NODE_ENV === 'prod') {
    module.exports = {
        MID: 'ddfactor5m',
        REACT_APP_API_URL:'https://api.ncdinos.com',
        MKEY: 'ZORxBjAfI7nWaxSiP1kB7l/Q/6LogWSuyxqpviDoDToyTFrhVF8YuTt7g40ddxpb3TV75Dvo91x7dUI9mZfrWg==',
        JWT_SECRET:'MFVGv2c2iT4yoT!zW9!wksoD',
        JWT_ISSUER: 'ddfactory',
        frontServer:'http://192.168.50.110:3001',
        NicepayBillingMid: 'ddfactor7m',
        NicepayBillingMkey: 'TUokKUWGnpMfc6e1RKxzg0kn//Nuq3Hm3dVgFQ5RulZ6AUsaIZJ/lhou7jhvlpN0mu7ddilx987J6J5kJJwMMg=='
    }
}else {
    module.exports = {
        MID: 'nicepay00m',
        REACT_APP_API_URL:'https://api.nc.ddfactory.kr',
        MKEY: 'EYzu8jGGMfqaDEp76gSckuvnaHHu+bC4opsSN6lHv3b2lurNYkVXrZ7Z1AoqQnXI3eLuaUFyoRNC6FkrzVjceg==',
        JWT_SECRET:'MFVGv2c2iT4yoT!zW9!wksoD',
        JWT_ISSUER: 'ddfactory',
        frontServer:'http://192.168.50.110:3001',
        NicepayBillingMid: 'ddfactor7m',
        NicepayBillingMkey: 'TUokKUWGnpMfc6e1RKxzg0kn//Nuq3Hm3dVgFQ5RulZ6AUsaIZJ/lhou7jhvlpN0mu7ddilx987J6J5kJJwMMg=='
        
    }
}

module.exports.channelID = 'CH00002034';// 'CH00002104'다이노스, //CH00002034 한화
