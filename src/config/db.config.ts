

if(process.env.NODE_ENV === 'prod') {
    module.exports = {
        'accountdb':{
            dialect: 'mysql',
            host: 'ncdinos-dev.cluster-cauqneoflkta.ap-northeast-2.rds.amazonaws.com',
            port: 3306,
            username: 'ddfactory',
            password: 'ddfactory1!',
            database: 'account',
            autoLoadModels: true,
            synchronize: false
        },'mddb':{
            dialect: 'mysql',
            host: 'ncdinos-dev.cluster-cauqneoflkta.ap-northeast-2.rds.amazonaws.com',
            port: 3306,
            username: 'ddfactory',
            password: 'ddfactory1!',
            database: 'md',
            autoLoadModels: true,
            synchronize: false 
        }
    }
} else {
    module.exports = {
        'accountdb':{
            dialect: 'mysql',
            host: 'ncdinos-dev.cluster-cauqneoflkta.ap-northeast-2.rds.amazonaws.com',
            port: 3306,
            username: 'ddfactory',
            password: 'ddfactory1!',
            database: 'account',
            autoLoadModels: true,
            synchronize: false
        },'mddb':{
            dialect: 'mysql',
            host: 'ncdinos-dev.cluster-cauqneoflkta.ap-northeast-2.rds.amazonaws.com',
            port: 3306,
            username: 'ddfactory',
            password: 'ddfactory1!',
            database: 'md',
            autoLoadModels: true,
            synchronize: false 
        }
    }
}