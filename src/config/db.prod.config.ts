module.exports = {
    'accountdb':{
        dialect: 'postgres',
        host: 'localhost',
        port: 5434,
        username: 'postgres',
        password: 'admin',
        database: 'account',
        autoLoadModels: true,
        synchronize: true
    },'mddb':{
        dialect: 'postgres',
        host: 'localhost',
        port: 5434,
        username: 'postgres',
        password: 'admin',
        database: 'md',
        autoLoadModels: true,
        synchronize: true 
    }
}
