var express = require('express')
var router = require('./router')
var bodyParser = require('body-parser')
var session = require('express-session')

var app = express()

/**
 * 配置解析表单请求体
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * 配置使用session
 */
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
}))

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    // res.header("Content-Type", "text/plain;charset=UTF-8");
    next();
});

app.use(router)

//统一处理500错误
app.use((err, req, res, next) => {
    res.status(500).json({
        error: err.message
    })
})

app.listen(3000, function () {
    console.log('server is listening on port 3000');
})
