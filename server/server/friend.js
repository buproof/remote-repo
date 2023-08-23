var dbserver = require('../dao/dbserver');

// 好友申请
exports.applyFriend = function (req, res) {
    let data = req.body;
    dbserver.applyFriend(data, res);
}

// 同意好友申请
exports.agreeFriend = function (req, res) {
    let data = req.body;
    dbserver.updateFriendState(data, res);
}

// 拒绝或删除好友
exports.deleteFriend = function (req, res) {
    let data = req.body;
    dbserver.deleteFriend(data, res);
}