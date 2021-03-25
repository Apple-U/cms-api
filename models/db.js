const mysql = require('mysql')

const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "1234",
    database: "cms",
})


module.exports.query = function (sqlStr) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err)
            }
            connection.query(sqlStr, (err, ...args) => {
                connection.release()
                if (err) {
                    return reject(err)
                }
                resolve(...args)
            })
        })
    })
}

// var sql = `select 1+1 as solution`
// query(sql).then((data) => { console.log(data); }, (err) => { console.log(err); })