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


// token判断
app.use(jwtAuthExclued);
// 引入路由
app.use(router);

// 引入附件上传插件
var multer = require('multer');
var mkdir = require('./dao/mkdir');
const path = require("path");

let storage = multer.diskStorage({
    //设置存储路径
    destination: (req, file, cb) => {
        let url = req.body.url;
        mkdir.mkdirs('../data/' + url, err => {
            console.log(err);
        });
        cb(null, './data/' + url)
    },
    //设置存储的文件名
    filename: (req, file, cb) => {
        let name = req.body.name;
        //获取文件的扩展名
        let extname = path.extname(file.originalname);
        filename = name + extname;
        cb(null, filename);
    }
})
let objMulter = multer({ storage });

app.use(objMulter.any())   //any表示任意类型的文件

app.use(express.static('./data'));//将静态资源托管，这样才能在浏览器上直接访问预览图片或则html页面

app.post('/files/upload', (req, res) => {
    let url = req.body.url
    let name = req.files[0].filename;
    let imgurl = '/' + url + '/' + name;
    res.send(imgurl);
});





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
