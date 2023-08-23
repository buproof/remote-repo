// 引入mongoose
var mongoose = require('mongoose');
// 连接本地的数据库
var db = mongoose.createConnection('mongodb://localhost:27017/chatroom');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.info('数据库chatroom 打开成功！')
});

module.exports = db;