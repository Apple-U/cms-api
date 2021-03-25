const db = require('../models/db')

exports.list = async (req, res, next) => {
    try {
        const { topic_id } = req.query
        const sqlStr = `
        select * from comments where topic_id='${topic_id}'
    `
        const comments = await db.query(sqlStr)
        res.status(200).json(comments)
    } catch (err) {
        next(err)
    }
}
exports.create = async (req, res, next) => {
    try {
        const body = req.body
        body.content = body.content ?? ''
        //todo :前端怎么传topic_id ?因为请求方法是post('/comments',fn)
        //按理来说表单中的body只有表单内容，而没有评论的文章所属的id
        body.topic_id = body.topic_id ?? 0
        body.create_time = Date.now()
        body.modify_time = Date.now()
        body.user_id = req.session.user.id

        const sqlStr = `
            insert into comments (content, topic_id, user_id, create_time, modify_time)
            values(
                '${body.content}', 
                '${body.topic_id}', 
                '${body.user_id}', 
                '${body.create_time}', 
                '${body.modify_time}')
         `

        const ret = await db.query(sqlStr)
        const [comment] = await db.query(`select * from comments where id=${ret.insertId}`)
        //201状态码表示 成功请求并且创建了新的资源
        res.status(201).json(comment)
    } catch (err) {
        next(err)
    }
}
exports.update = async (req, res, next) => {
    try {
        // 获取路径参数
        const { id } = req.params
        // 获取表单数据
        const body = req.body
        const sqlStr = `
            update comments 
            set 
            content = '${body.content}',
            modify_time = '${Date.now()}' 
            where id = ${id}
        `

        // 执行更新操作
        await db.query(sqlStr)

        const [updatedComment] = await db.query(`
            select * from comments where id = ${id}
        `)

        res.status(201).json(updatedComment)
    } catch (err) {
        next(err)
    }
}
exports.destroy = async (req, res, next) => {
    try {
        var { id } = req.params
        var sql = `
            delete from comments where id='${id}'`
        await db.query(sql)
        res.status(201).json({})
    }
    catch (err) {
        next(err)
    }
}