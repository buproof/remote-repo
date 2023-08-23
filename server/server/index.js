// 主页
var dbserver = require('../dao/dbserver');

// 获取好友列表
exports.getFriend = function (req, res) {
    let data = req.body;
    // dbserver.getUsers1(data, res);
    if (data.state == 0) {
        // 获取好友聊天列表
        dbserver.getUsers(data, res);
    } else if (data.state == 1) {
        // 获取好友申请列表
        dbserver.getUsers1(data, res);
    }
}

// 获取最后一条消息
exports.getLastMsg = function (req, res) {
    let data = req.body;
    dbserver.getOneMsg(data, res);
}

// 获取未读消息数
exports.unreadMsg = function (req, res) {
    let data = req.body;
    dbserver.unreadMsg(data, res);
}

// 消息标已读
exports.updateMsgState = function (req, res) {
    let data = req.body;
    dbserver.updateMsgState(data, res);
}

// 获取群列表
exports.getGroup = function (req, res) {
    let uid = req.body.uid;
    dbserver.getGroup(uid, res);
}

// 获取群最后一条消息
exports.getLastGroupMsg = function (req, res) {
    let gid = req.body.gid;
    dbserver.getOneGroupMsg(gid, res);
}

exports.getGroups = function (req, res) {
    let data = req.body;
    dbserver.getGroups(data, res);
}

// 群消息标已读
exports.updateGroupMsgState = function (req, res) {
    let data = req.body;
    dbserver.updateGroupMsgState(data, res);
}