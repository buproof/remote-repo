var dbserver = require('../dao/dbserver');

// 获取分页一对一聊天数据
exports.msg = function (req, res) {
    let data = req.body;
    dbserver.msg(data, res);
}

// 获取分页群聊天数据
exports.gmsg = function (req, res) {
    let data = req.body;
    dbserver.gmsg(data, res);
}