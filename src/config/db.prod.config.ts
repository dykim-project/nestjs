module.exports = {
    'accountdb':{
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'admin',
        database: 'order_temp',
        autoLoadModels: true,
        synchronize: false
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
