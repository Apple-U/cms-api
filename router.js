var express = require('express')
var router = express.Router()
var userController = require('./controllers/user')
var topicController = require('./controllers/topic')
var commentController = require('./controllers/comment')
var sessionController = require('./controllers/session')
const db = require('./models/db')


//定义中间件，需要验证的地方调用这个中间件即可
//只有这个中间件没有执行return()并且调用了next()方法 就可以跳到下一个参数（函数）
function checkLogin(req, res, next) {
    var user = req.session.user
    if (!user) {
        return res.status(401).json({
            err: 'Unauthorized'
        })
    }
    next()
}

//话题有关中间件
async function checkTopic(req, res, next) {
    try {
        const { id } = req.params
        const [topic] = await db.query(
            `select * from topics where id =${id}
            `)

        //检查话题是否存在    
        if (!topic) {
            return res.status(404).json({
                err: 'Topic not find'
            })
        }

        //检查话题是否属于当前用户 当前用户有编辑和删除的权限
        if (topic.user_id !== req.session.user.id) {
            return res.status(400).json({
                err: 'Current user has no permission'
            })
        }

    } catch (err) {
        next(err) //这里已经跳出这个函数了，所以这里的next不是中间件中的next
    }

    next()
}

//是否可以封装 只是传的查询的数据表不同罢了 
//但是不太清楚这里的req, res, next参数是否会受到新加的参数的位置影响
//评论有关中间件
async function checkComment(req, res, next) {
    try {
        const { id } = req.params
        const [comment] = await db.query(
            `select * from comments where id =${id}
            `)

        //检查话题是否存在    
        if (!comment) {
            return res.status(404).json({
                err: 'comment not find'
            })
        }

        //检查话题是否属于当前用户 当前用户有编辑和删除的权限
        if (comment.user_id !== req.session.user.id) {
            return res.status(400).json({
                err: 'Current user has no permission'
            })
        }

    } catch (err) {
        next(err) //这里已经跳出这个函数了，所以这里的next不是中间件中的next
    }

    next()
}

async function checkTopicWhenComment(req, res, next) {
    try {
        var topicSql
        if (~~req.params.id) {
            const comment_id = req.params.id
            const sqlStr = `select * from comments where id='${comment_id}'`
            const [comment] = await db.query(sqlStr)
            if (!comment) {
                return res.status(404).json({
                    error: 'comment not found'
                })
            }
            topicSql = `select * from topics where id ='${comment.topic_id}'`
        } else {
            topicSql = `select * from topics where id ='${req.body.topic_id}'`
        }
        const [topic] = await db.query(topicSql)
        if (!topic) {
            return res.status(404).json({
                error: 'topic not found'
            })
        }
        next()
    } catch (err) {
        next(err)
    }
}

/**
 * 用户资源
 */
router
    .get('/users', userController.list)
    .post('/users', userController.create)
    .patch('/users/:id', checkLogin, userController.update)
    .delete('/users/:id', checkLogin, userController.destroy)

/**
 * 话题资源
 */
router
    .get('/topics', topicController.list)
    .get('/topics/:id', topicController.one)
    .post('/topics', checkLogin, topicController.create)
    .patch('/topics/:id', checkLogin, checkTopic, topicController.update)
    .delete('/topics/:id', checkLogin, topicController.destroy)

/**
 * 评论资源
 */
router
    //http://127.0.0.1:3000/comments?topic_id=1
    //由此体现设计接口的重要性 是根据topic_id来加载评论的 而不是加载所有评论
    .get('/comments', commentController.list)
    //如果topic_id在req.body中
    .post('/comments', checkLogin, checkTopicWhenComment, commentController.create)
    //这里的id指的是comments表中的id
    .patch('/comments/:id', checkLogin, checkTopicWhenComment, checkComment, commentController.update)
    .delete('/comments/:id', checkLogin, checkComment, commentController.destroy)

/**
 * 会话资源
 */
router
    .get('/session', sessionController.get)
    .post('/session', sessionController.create)
    .delete('/session', sessionController.destroy)


module.exports = router



