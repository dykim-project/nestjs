
if(process.env.NODE_ENV === 'prod') {
    module.exports = {
        MID: 'ddfactor5m',
        REACT_APP_API_URL:'https://api.ncdinos.com',
        MKEY: 'ZORxBjAfI7nWaxSiP1kB7l/Q/6LogWSuyxqpviDoDToyTFrhVF8YuTt7g40ddxpb3TV75Dvo91x7dUI9mZfrWg==',
        JWT_SECRET:'MFVGv2c2iT4yoT!zW9!wksoD',
        JWT_ISSUER: 'ddfactory',
        frontServer:'http://localhost:3001'

    }
}else {
    module.exports = {
        MID: 'nicepay00m',
        REACT_APP_API_URL:'https://api.nc.ddfactory.kr',
        MKEY: 'EYzu8jGGMfqaDEp76gSckuvnaHHu+bC4opsSN6lHv3b2lurNYkVXrZ7Z1AoqQnXI3eLuaUFyoRNC6FkrzVjceg==',
        JWT_SECRET:'MFVGv2c2iT4yoT!zW9!wksoD',
        JWT_ISSUER: 'ddfactory',
        frontServer:'http://localhost:3001'
    }
}