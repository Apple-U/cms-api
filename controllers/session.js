const md5 = require('blueimp-md5')
const session = require('express-session')
const db = require('../models/db')

/**
 * 获取会话状态
 */
exports.get = function (req, res, next) {
    const { user } = req.session
    if (!user) {
        res.status(401).json({
            err: 'Unauthorized'
        })
    }
    res.status(200).json(user)
}

/**
 * 创建会话：用户登录
 */
exports.create = async function (req, res, next) {
    //接收表单请求
    //操作数据库处理登录请求
    //发送响应
    try {
        const body = req.body
        body.password = md5(md5(body.password))

        const sqlStr = `select * from users where email='${body.email}' and password='${body.password}'`
        const [user] = await db.query(sqlStr)
        if (!user) {
            //不是真的error 只是状态码404 是没找到
            //真的error 是报错 在app.js中统一500状态码处理
            return res.status(404).json({
                error: 'Invalid email or password!'
            })
        }

        //登陆成功，记录session
        req.session.user = user

        //发送响应
        res.status(201).json(user)
    } catch (err) {
        next(err)
    }
}

/**
 * 注销登录
 */
exports.destroy = function (req, res, next) {
    delete req.session.user
    res.status(201).json({})
}