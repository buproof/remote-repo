// 引入nodemailer
var nodemailer = require('nodemailer');
// 引入证书文件
var certificate = require('../config/certificate')

// 创建传输方式
var transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: certificate.qq.user,
        pass: certificate.qq.pass,
    }
});

// 注册发送邮件给用户
exports.emailSignUp = function (email, res) {
    // 发送信息内容
    let options = {
        from: '745653698@qq.com',
        to: email,
        subject: '感谢您在chatroom注册',
        html: '<span>chatroom欢迎你的加入!</span><a href="http://localhost:8080/">点击</a>'
    };

    // 发送邮件
    transporter.sendMail(options, function (err, msg) {
        if (err) {
            res.send(err);
        } else {
            res.send('邮件发送成功!')
        }
    })
}