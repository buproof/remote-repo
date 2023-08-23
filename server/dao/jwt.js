// token
// 引入token
const jwt = require('jsonwebtoken');
var secret = 'chatroom';

// 生成token
module.exports.generateToken = function (e) {
    let payload = { id: e, time: new Date() };
    let token = jwt.sign(payload, secret, { expiresIn: 60 * 60 * 24 * 30 });

    return token;
}

const jwtAuthMiddleware = (req, res, next) => {
    let token = req.body.token;
    if (!token) {
        // return res.send({ status: 500 });
        return res.send({ status: 500 });
    }
    if (token) {
        try {
            jwt.verify(token, secret);
            next();
        } catch (error) {
            res.send({ status: 300 });
        }
    } else {
        next();
    };
}
// 承认的url排除列表
const jwtAuthExcluedList = ['/login/match', '/register/add', '/register/judge'];

// 检查排除列表的中间件
module.exports.jwtAuthExclued = (req, res, next) => {
    // 检查请求 URL 是否在排除 jwtAuth 的列表里面
    if (jwtAuthExcluedList.includes(req.path)) {
        next(); // 在列表里，跳过后续中间件
    } else {
        jwtAuthMiddleware(req, res, next); // 不在列表里，就调用jwt中间件进行身份认证
    }
};