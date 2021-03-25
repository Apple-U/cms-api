const db = require('../models/db')

exports.list = async (req, res, next) => {
    try {
        //get方法 ？xxxx来传参的
        let { _page = 1, _limit = 20 } = req.query

        if (_page < 1) {
            _page = 1
        }

        if (_limit < 1) {
            _limit = 1
        }

        if (_limit > 20) {
            _limit = 20
        }

        //分页处理开始的索引
        const start = (parseInt(_page) - 1) * _limit

        /*从数据库获取部分数据的语法：limit 开始的位置 ,长度*/
        const sqlStr = `
            select * from topics limit ${start},${_limit}    
        `
        const topics = await db.query(sqlStr)

        const [{ count }] = await db.query(`
        select count(*) as count from topics`)

        res.status(200).json({
            topics,
            count
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 获取单个话题
 */

exports.one = async (req, res, next) => {
    try {
        const { id } = req.params
        const sqlStr = `
            select * from topics where id ='${id}'
        `
        const topics = await db.query(sqlStr)
        //todo: 处理话题可能查不到的情况
        res.status(200).json(topics[0])

    } catch (err) {
        next(err)
    }
}

/**
 * 创建话题
 */
exports.create = async (req, res, next) => {
    try {
        const body = req.body
        body.create_time = Date.now()
        body.modify_time = Date.now()
        body.user_id = req.session.user.id

        const sqlStr = `
            insert into topics (title, content, user_id, create_time, modify_time)
            values(
                '${body.title}', 
                '${body.content}', 
                '${body.user_id}', 
                '${body.create_time}', 
                '${body.modify_time}')
         `

        const ret = await db.query(sqlStr)
        const [topic] = await db.query(`select * from topics where id=${ret.insertId}`)
        //201状态码表示 成功请求并且创建了新的资源
        res.status(201).json(topic)
    } catch (err) {
        next(err)
    }
}

/**
 * 更新话题
 */

exports.update = async (req, res, next) => {
    try {
        // 获取路径参数
        const { id } = req.params
        // 获取表单数据
        const body = req.body
        const sqlStr = `
            update topics 
            set title = '${body.title}',
            content = '${body.content}',
            modify_time = '${Date.now()}' 
            where id = ${id}
        `

        // 执行更新操作
        await db.query(sqlStr)

        const [updatedTopic] = await db.query(`
            select * from topics where id = ${id}
        `)

        res.status(201).json(updatedTopic)
    } catch (err) {
        next(err)
    }
}

/**
 * 删除话题
 */

exports.destroy = async (req, res, next) => {
    try {
        var { id } = req.params
        var sql = `
            delete from topics where id='${id}'`
        await db.query(sql)
        res.status(201).json({})
    }
    catch (err) {
        next(err)
    }

}