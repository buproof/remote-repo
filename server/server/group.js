var dbserver = require('../dao/dbserver');

// 新建群
exports.createGroup = function (req, res) {
    let data = req.body;
    dbserver.createGroup(data, res);
}

// 添加群消息
exports.insertGroupMsg = function (req, res) {
    let data = req.body;
    dbserver.createGroup(data, res);
}