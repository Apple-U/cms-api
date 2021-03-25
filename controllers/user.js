var db = require('../models/db')
const md5 = require('blueimp-md5')


exports.list = async (req, res, next) => {
    try {
        var sqlCondition = ' 1=1 '
        for (key in req.query) {
            sqlCondition += `and ${key} ='${req.query[key]}' `
        }
        const sqlStr = `SELECT * FROM users where ${sqlCondition} `
        res.status(200).json(await db.query(sqlStr))
    } catch (err) {
        next(err)
    }
}

exports.create = async (req, res, next) => {
    try {
        const body = req.body
        const sqlStr =
            `insert into users(username, password, email, nickname, avatar, gender, create_time, modify_time)
        values(
            '${body.username}',
            '${md5(md5(body.password))}',
            '${body.email}',
            '${body.nickname}',
            'default-avatar.png',
            0,
            ${Date.now()},
            ${Date.now()}
        )`

        //执行插入insert命令 返回的是一个对象 里面有一个insertId 
        //数据库users表格中 id为主键 并且自动逐个递增    
        const ret = await db.query(sqlStr)
        //返回完整对象
        const users = await db.query(`select * from users where id = ${ret.insertId} `)
        res.status(201).json(users[0])
    } catch (err) {
        next(err)
    }
}

exports.update = async (req, res, next) => {
    try {
        var { id } = req.params
        var body = req.body

        var sqlStr = `update users set 
            username='${body.username}',
            password='${md5(md5(body.password))}',
            email='${body.email}',
            avatar='${body.avatar}',
            modify_time='${Date.now()}'
            where id=${id}
        `
        var ret = await db.query(sqlStr);
        var users = await db.query(`select * from users where id=${id}`)
        res.status(201).json(users[0])
    } catch (err) {
        next(err)
    }

}

exports.destroy = async (req, res, next) => {
    try {
        var { id } = req.params
        var sql = `
            delete from users where id='${id}'`
        await db.query(sql)
        res.status(201).json({})
    }
    catch (err) {
        next(err)
    }
}