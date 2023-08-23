const express = require('express');
const router = express.Router();


var dbserver = require('../dao/dbserver');

// 引入邮箱发送方法
var emailserver = require('../dao/emailserver');
// 注册页面服务
var reg = require('../server/register');
// 登录页面服务
var login = require('../server/login');
// 搜索页面服务
var search = require('../server/search');
// 用户详情页服务
var user = require('../server/userdetail');
// 好友页面操作
var friend = require('../server/friend');
// 首页操作
var ind = require('../server/index');
// 聊天页面操作
var chat = require('../server/chat');
// 群操作
var group = require('../server/group');


router.get('/test', (req, res) => {
    dbserver.findUser(res);
});
// 邮箱测试
router.post('/mail', (req, res) => {
    let mail = req.body.mail;
    emailserver.emailSignUp(mail, res);
    // res.send(mail)
    // console.log(mail);
})

// 注册页面
// 注册
router.post('/register/add', (req, res) => {
    reg.register(req, res);
})

// 用户或邮箱是否被占用判断
router.post('/register/judge', (req, res) => {
    reg.judgeValue(req, res);
})

// 登录页面
// 登录
router.post('/login/match', (req, res) => {
    login.login(req, res);
})

// 搜索页面
// 搜索用户
router.post('/search/user', (req, res) => {
    search.searchUser(req, res);
})

// 判断是否为好友
router.post('/search/isfriend', (req, res) => {
    search.isFriend(req, res);
})

// 搜索群
router.post('/search/group', (req, res) => {
    search.searchGroup(req, res);
})

// 判断是否在群内
router.post('/search/isingroup', (req, res) => {
    search.isInGroup(req, res);
})

// 用户详情
// 详情
router.post('/user/detail', (req, res) => {
    user.userDetail(req, res)
})
// 用户信息修改
router.post('/user/update', (req, res) => {
    user.userUpdate(req, res)
})
// 获取好友昵称
router.post('/user/getnickname', (req, res) => {
    user.getNickName(req, res)
})
// 好友昵称修改
router.post('/user/updatenickname', (req, res) => {
    user.updateNickName(req, res)
})

// 好友操作
// 申请好友
router.post('/friend/applyfriend', (req, res) => {
    friend.applyFriend(req, res);
})
// 同意好友申请
router.post('/friend/agreefriend', (req, res) => {
    friend.agreeFriend(req, res);
})
// 拒绝或删除好友
router.post('/friend/deletefriend', (req, res) => {
    friend.deleteFriend(req, res);
})

// 主页
// 获取好友列表
router.post('/index/getfriend', (req, res) => {
    ind.getFriend(req, res);
})

// 获取最后一条消息
router.post('/index/getlastmsg', (req, res) => {
    ind.getLastMsg(req, res);
})

// 获取未读消息数
router.post('/index/unreadmsg', (req, res) => {
    ind.unreadMsg(req, res);
})

// 消息标已读
router.post('/index/updatemsg', (req, res) => {
    ind.updateMsgState(req, res);
})

// 获取群列表
router.post('/index/getgroup', (req, res) => {
    ind.getGroup(req, res);
})

// 获取群最后一条消息
router.post('/index/getlastgroupmsg', (req, res) => {
    ind.getLastGroupMsg(req, res);
})

router.post('/index/getgroups', (req, res) => {
    ind.getGroups(req, res);
})

// 群消息未读数
router.post('/index/updategroupmsg', (req, res) => {
    ind.updateGroupMsgState(req, res);
})

// 聊天页面
// 分页获取一对一聊天数据
router.post('/chat/msg', (req, res) => {
    chat.msg(req, res);
})
// 分页获取群聊天数据
router.post('/chat/gmsg', (req, res) => {
    chat.gmsg(req, res);
})


// 建群
router.post('/group/creategroup', (req, res) => {
    group.createGroup(req, res);
})









module.exports = router