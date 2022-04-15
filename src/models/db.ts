const mysql = require('mysql2/promise')
const dbConfig = process.env.NODE_ENV == 'production' ? 
                require("../config/db.prod.config.js") : require("../config/db.dev.config.js");

// 데이터베이스 connection 객체 생성
export const createConnection = async (database: string) => {
    return await mysql.createConnection({
        host: database === 'account' ? dbConfig.account_hostname : dbConfig.md_hostname,
        user: dbConfig.username,
        password: dbConfig.password,
        database
    });
}

