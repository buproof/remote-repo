var dbserver = require('../dao/dbserver');
var email = require('../dao/emailserver');

// 用户注册
exports.register = function (req, res) {
    let name = req.body.name;
    let mail = req.body.mail;
    let pwd = req.body.pwd;

    // 发送邮件
    // email.emailSignUp(mail,res);
    dbserver.buildUser(name, mail, pwd, res);
}

// 用户/邮箱是否被占用判断
exports.judgeValue = function (req, res) {
    let data = req.body.data;
    let type = req.body.type;

    dbserver.countUserValue(data, type, res)
}
