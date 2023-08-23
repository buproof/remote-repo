const express = require('express');
const app = express();
const router = require('./router/index');
const port = 3000;

// socket.io
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
require('./dao/socket')(io);
server.listen(8082);

// 引入解析req.body插件
var bodyParser = require('body-parser');
// 引入jwt判断
const { jwtAuthExclued } = require('./dao/jwt');

// 解决跨域问题
app.all("*", function (req, res, next) {
    // 设置允许跨域的域名,*代表允许任意域名跨域
    res.header('Access-Control-Allow-Origin', '*');
    // 允许的header类型
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    // 跨域允许的请求方式
    res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS');
    res.header('Content-Type', 'application/json; charset=utf-8');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200); // 让options 尝试请求快速结束
    } else {
        next();
    }
})
app.get('/', (req, res) => {
    res.send('Hello World!')
})
// 解析前端数据
app.use(bodyParser.json());
// 获取静态路径
app.use(express.static(__dirname + '/data'));


// token判断
app.use(jwtAuthExclued);
// 引入路由
app.use(router);
require('./router/files')(app);

// 引入附件上传插件
var multer = require('multer');
var mkdir = require('./dao/mkdir');


// 控制文件存储
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let url = req.body.url;
        mkdir.mkdirs('./data/' + url, err => {
            console.log(err);
        });
        cb(null, './data/' + url)
    },
    filename: function (req, file, cb) {
        let name = req.body.name;
        // 正则匹配后缀名
        let type = file.originalname.replace(/.+\./, ".");
        cb(null, name + type);
    }
})

// var upload = multer({ storage: storage })
const upload = multer({ dest: 'data/group' })


app.post('/files/upload', upload.array('file', 9), function (req, res, next) {
    let url = req.body.url
    let name = req.files[0].filename;
    let imgurl = '/' + url + '/' + name;
    res.send(imgurl);
})


// 404页面
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
})

// 出现错误处理
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err);
    next();
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})