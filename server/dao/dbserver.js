// 数据库
// 引入加密文件
var bcrypt = require('../dao/bcrypt');
// 引入token
var jwt = require('../dao/jwt');
var dbmodel = require('../model/dbmodel');

var User = dbmodel.model('User');
var Friend = dbmodel.model('Friend');
var Group = dbmodel.model('Group');
var GroupMember = dbmodel.model('GroupMember');
var Message = dbmodel.model('Message');
var GroupMsg = dbmodel.model('GroupMsg');

// 新建用户
exports.buildUser = function (name, mail, pwd, res) {
    // 密码加密
    let password = bcrypt.encryption(pwd);

    let data = {
        name: name,
        email: mail,
        psw: password,
        time: new Date(),
    }

    let user = new User(data);

    user.save().then(() => {
        res.send({ status: 200 });
    }).catch((err) => {
        res.send({ status: 500 });
    })
}

// 匹配用户表元素个数
exports.countUserValue = function (data, type, res) {
    let wherestr = {};
    // wherestr = {'type':data};
    wherestr[type] = data;

    User.countDocuments(wherestr).then(result => {
        res.send({ status: 200, result });
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 用户验证
exports.userMatch = function (data, pwd, res) {
    let wherestr = { $or: [{ 'name': data }, { 'email': data }] };
    let out = { 'name': 1, 'imgurl': 1, 'psw': 1 };

    User.find(wherestr, out).then(result => {
        if (!result) {
            return res.send({ status: 400 });
        }
        result.map(function (e) {
            let pwdMatch = bcrypt.verification(pwd, e.psw);
            if (pwdMatch) {
                let token = jwt.generateToken(e._id);
                let back = {
                    id: e._id,
                    name: e.name,
                    imgurl: e.imgurl,
                    token: token,
                }
                return res.send({ status: 200, back });
            } else {
                return res.send({ status: 400 });
            }
        })
    }).catch(err => {
        console.log(err);
        res.send({ status: 500 });
    })
}

// 搜索用户
exports.searchUser = function (data, res) {
    let wherestr;
    if (data == 'chatroom') {
        wherestr = {};
    } else {
        // 模糊查找
        wherestr = { $or: [{ 'name': { $regex: data } }, { 'email': { $regex: data } }] };
    }

    let out = { 'name': 1, 'email': 1, 'imgurl': 1 };

    User.find(wherestr, out).then(result => {
        res.send({ status: 200, result });
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 判断是否为好友
exports.isFriend = function (uid, fid, res) {
    let wherestr = { 'userID': uid, 'friendID': fid, 'state': 0 };

    Friend.findOne(wherestr).then(result => {
        if (result) {
            // 是好友
            res.send({ status: 200 });
        } else {
            // 不是好友
            res.send({ status: 400 });
        }
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 搜索群
exports.searchGroup = function (data, res) {
    let wherestr;
    if (data == 'chatroom') {
        wherestr = {};
    } else {
        // 模糊查找
        wherestr = { 'name': { $regex: data } };
    }

    let out = { 'name': 1, 'imgurl': 1 };

    Group.find(wherestr, out).then(result => {
        res.send({ status: 200, result });
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 判断是否在群内
exports.isInGroup = function (uid, gid, res) {
    let wherestr = { 'userID': uid, 'groupID': gid };

    GroupMember.findOne(wherestr).then(result => {
        if (result) {
            // 在群内
            res.send({ status: 200 });
        } else {
            // 不在群内
            res.send({ status: 400 });
        }
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 用户详情
exports.userDetail = function (id, res) {
    let wherestr = { '_id': id };
    let out = { 'psw': 0 };
    User.findOne(wherestr, out).then(result => {
        if (result) {
            res.send({ status: 200, result });
        }
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 用户信息修改
exports.userUpdate = function (data, res) {
    let updatestr = {};

    // 判断是否有密码
    if (typeof (data.pwd) != 'undefined') {
        // 有密码先来进行匹配
        User.find({ '_id': data.id }, { 'psw': 1 }).then(result => {
            if (result == '') {
                res.send({ status: 400 });
            }
            result.map(function (e) {
                // data.pwd为原密码     data.data为新密码
                const pwdMatch = bcrypt.verification(data.pwd, e.psw);
                if (pwdMatch) {
                    // 密码匹配成功
                    // 如果为修改密码先加密
                    if (data.type == 'psw') {
                        // 密码加密
                        let password = bcrypt.encryption(data.content);
                        updatestr[data.type] = password;
                        User.findByIdAndUpdate(data.id, updatestr).then(resu => {
                            // 修改成功
                            res.send({ status: 200 });
                        }).catch(err => {
                            // 修改失败
                            res.send({ status: 500 });
                        })
                    } else {
                        // 邮箱匹配
                        updatestr[data.type] = data.content;
                        User.countDocuments(updatestr).then(result => {
                            if (result == 0) {
                                // 没有匹配项，可以使用
                                User.findByIdAndUpdate(data.id, updatestr).then(resu => {
                                    // 修改成功
                                    res.send({ status: 200 });
                                }).catch(err => {
                                    // 修改失败
                                    res.send({ status: 500 });
                                })
                            } else {
                                // 已存在，不可修改
                                res.send({ status: 600 });
                            }
                        }).catch(err => {
                            res.send({ status: 500 });
                        })
                    }
                } else {
                    // 密码匹配失败
                    res.send({ status: 400 });
                }
            })
        }).catch(err => {
            res.send({ status: 500 });
        })
    } else if (data.type == 'email') {
        if (!data.pwd) {
            res.send({ status: 500 });
        }
    }
    else if (data.type == 'name') {
        // 如果为修改用户名，要先进行匹配，看新用户是否已存在
        updatestr[data.type] = data.content;
        User.countDocuments(updatestr).then(result => {
            if (result == 0) {
                // 没有匹配项，可以使用
                User.findByIdAndUpdate(data.id, updatestr).then(resu => {
                    // 修改成功
                    res.send({ status: 200 });
                }).catch(err => {
                    // 修改失败
                    res.send({ status: 500 });
                })
            } else {
                // 已存在，不可修改
                res.send({ status: 300 });
            }
        }).catch(err => {
            res.send({ status: 500 });
        })
    } else {
        updatestr[data.type] = data.content;
        User.findByIdAndUpdate(data.id, updatestr).then(resu => {
            // 修改成功
            res.send({ status: 200 });
        }).catch(err => {
            // 修改失败
            res.send({ status: 500 });
        })
    }
}

// 获取好友昵称
exports.getNickName = function (data, res) {
    let wherestr = { 'userID': data.uid, 'friendID': data.fid };
    let out = { 'nickname': 1 };
    Friend.findOne(wherestr, out).then(result => {
        res.send({ status: 200, result });
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 修改好友昵称
exports.updateNickName = function (data, res) {
    let wherestr = { 'userID': data.uid, 'friendID': data.fid };
    let updatestr = { 'nickname': data.name };
    Friend.updateOne(wherestr, updatestr).then(result => {
        // 修改成功
        res.send({ status: 200 });
    }).catch(err => {
        // 修改失败
        res.send({ status: 500 });
    })
}

// 好友操作
// 添加好友表
exports.buildFriend = function (uid, fid, state, res) {
    let data = {
        userID: uid,
        friendID: fid,
        state: state,
        time: new Date(),
        lastTime: new Date(),
    }

    let friend = new Friend(data);

    friend.save().then(() => {
        // res.send({ status: 200 });
    }).catch((err) => {
        // res.send({ status: 500 });
        console.log(err);
    })
}
// 更新好友最后通讯时间
exports.updatefLastTime = function (data) {
    let wherestr = { $or: [{ 'userID': data.uid, 'friendID': data.fid }, { 'userID': data.fid, 'friendID': data.uid }] };
    let updatestr = { 'lastTime': new Date() };

    Friend.updateMany(wherestr, updatestr).then(result => {
        // res.send({ status: 200 });
    }).catch(err => {
        // res.send({ status: 500 });
        console.log(err);
    })
}
// 添加一对一消息
exports.insertMsg = function (uid, fid, msg, type, res) {
    let data = {
        userID: uid,
        friendID: fid,
        message: msg,
        types: type,
        state: 1,
        time: new Date(),
    }

    let message = new Message(data);

    message.save().then(() => {
        if (res) {
            res.send({ status: 200 });
        }
    }).catch((err) => {
        if (res) {
            res.send({ status: 500 });
        }
    })
}

// 好友申请
exports.applyFriend = function (data, res) {
    // 判断是否已经申请过
    let wherestr = { 'userID': data.uid, 'friendID': data.fid };
    Friend.countDocuments(wherestr).then(result => {
        // 如果result=0为初次申请
        if (result == 0) {
            this.buildFriend(data.uid, data.fid, 2);
            this.buildFriend(data.fid, data.uid, 1);
        } else {
            // 已经申请过好友
            this.updatefLastTime(data);
        }
        // 添加消息
        this.insertMsg(data.uid, data.fid, data.msg, 0, res);
    }).catch(err => {
        res.send({ status: 500 });
    })
}
// 更新好友状态
exports.updateFriendState = function (data, res) {
    let wherestr = { $or: [{ 'userID': data.uid, 'friendID': data.fid }, { 'userID': data.fid, 'friendID': data.uid }] };

    Friend.updateMany(wherestr, { 'state': 0 }).then(result => {
        res.send({ status: 200 });
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 拒绝或删除好友
exports.deleteFriend = function (data, res) {
    let wherestr = { $or: [{ 'userID': data.uid, 'friendID': data.fid }, { 'userID': data.fid, 'friendID': data.uid }] };

    Friend.deleteMany(wherestr).then(result => {
        res.send({ status: 200 });
    }).catch(err => {
        res.send({ status: 500 });
    })
}


//按要求获取用户列表，解决异步
exports.getUsers1 = function (data, res) {
    return new Promise(function (resolve, reject) {
        let query = Friend.find({});
        // 查询条件
        query.where({ 'userID': data.uid, 'state': data.state });
        // 查找friendID 关联的user对象
        query.populate('friendID');
        // 排序方式 倒序（从大到小）
        query.sort({ 'lastTime': -1 });
        // 查询结果
        query.exec().then(function (e) {
            let result = e.map(ver => {
                return {
                    id: ver.friendID._id,
                    name: ver.friendID.name,
                    nickname: ver.friendID.nickname,
                    imgurl: ver.friendID.imgurl,
                    lastTime: ver.lastTime,
                    type: 0,
                }
            })
            resolve({ status: 200, result });
        }).catch(err => {
            reject({ status: 500 });
        })
    }).then(function onFulfilled(value) {
        res.send(value);
    })
}

function getUser(data) {
    return new Promise(function (resolve, reject) {
        let query = Friend.find({});
        // 查询条件
        query.where({ 'userID': data.uid, 'state': data.state });
        // 查找friendID 关联的user对象
        query.populate('friendID');
        // 排序方式 倒序（从大到小）
        query.sort({ 'lastTime': -1 });
        // 查询结果
        query.exec().then(function (e) {
            let result = e.map(ver => {
                return {
                    id: ver.friendID._id,
                    name: ver.friendID.name,
                    nickname: ver.friendID.nickname,
                    imgurl: ver.friendID.imgurl,
                    lastTime: ver.lastTime,
                    type: 0,
                }
            })
            resolve(result);
        }).catch(err => {
            reject({ status: 500 });
        })
    })
}
function getOneMsg(uid, fid) {
    return new Promise(function (resolve, reject) {
        let query = Message.findOne({});
        // 查询条件
        query.where({ $or: [{ 'userID': uid, 'friendID': fid }, { 'userID': fid, 'friendID': uid }] });
        // 排序方式 倒序（从大到小）
        query.sort({ 'time': -1 });
        // 查询结果
        query.exec().then(function (ver) {
            let result = {
                message: ver.message,
                time: ver.time,
                types: ver.types,
            }
            resolve(result);
        }).catch(err => {
            reject({ status: 500 });
        })
    })
}
function unreadMsg(uid, fid) {
    return new Promise(function (resolve, reject) {
        // 汇总条件
        let wherestr = { 'userID': fid, 'friendID': uid, 'state': 1 };
        Message.countDocuments(wherestr).then(result => {
            resolve(result);
        }).catch(err => {
            reject({ status: 500 });
        })
    })
}
// 联合查找好友、获取最后一条消息和未读消息数
async function doIt(data, res) {
    let result, bb, cc, err;
    [err, result] = await getUser(data).then(data => [null, data]).catch(err => [err, null])
    for (var i = 0; i < result.length; i++) {
        [err, bb] = await getOneMsg(data.uid, result[i].id).then(data => [null, data]).catch(err => [err, null])
        if (bb.types == 0) {
            // 文字
        } else if (bb.types == 1) {
            // 图片
            bb.message = '[图片]';
        } else if (bb.types == 2) {
            // 音频
            bb.message = '[语音]';
        } else if (bb.types == 3) {
            // 位置
            bb.message = '[位置]';
        }
        result[i].msg = bb.message;
        [err, cc] = await unreadMsg(data.uid, result[i].id).then(data => [null, data]).catch(err => [err, null])
        result[i].tip = cc;
    }
    if (err) {
        res.send(err);
    } else {
        res.send({ status: 200, result });
    }
}
exports.getUsers = function (data, res) {
    doIt(data, res)
}
// 按要求获取一条一对一消息
exports.getOneMsg = function (data, res) {
    let query = Message.findOne({});
    // 查询条件
    query.where({ $or: [{ 'userID': data.uid, 'friendID': data.fid }, { 'userID': data.fid, 'friendID': data.uid }] });
    // 排序方式 倒序（从大到小）
    query.sort({ 'time': -1 });
    // 查询结果
    query.exec().then(function (ver) {
        let result = {
            message: ver.message,
            time: ver.time,
            types: ver.types,
        }
        res.send({ status: 200, result });
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 汇总一对一未读消息数
exports.unreadMsg = function (data, res) {
    // 汇总条件
    let wherestr = { 'userID': data.uid, 'friendID': data.fid, 'state': 1 };
    Message.countDocuments(wherestr).then(result => {
        res.send({ status: 200, result });
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 一对一消息状态修改
exports.updateMsgState = function (data, res) {
    // 修改项条件
    let wherestr = { 'userID': data.uid, 'friendID': data.fid, 'state': 1 };
    // 修改内容
    let updatestr = { 'state': 0 };

    Message.updateMany(wherestr, updatestr).then(result => {
        if (res) {
            res.send({ status: 200 });
        }
    }).catch(err => {
        if (res) {
            res.send({ status: 500 });
        }
    })
}

// 新建群
exports.createGroup = function (data, res) {
    return new Promise(function (resolve, reject) {
        let groupData = {
            userID: data.uid,      // 用户id
            name: data.name,       // 群名称
            imgurl: data.imgurl,   // 群头像
            time: new Date(),      // 创建时间
        }
        var group = new Group(groupData);

        group.save().then(result => {
            resolve(result);
        }).catch(err => {
            reject({ status: 500 })
        })

    }).then(function onFulfilled(value) {
        // 添加好友进群
        for (let i = 0; i < data.user.length; i++) {
            let fdata = {
                groupID: value._id,     // 群id
                userID: data.user[i],   // 用户id
                time: new Date(),       // 加入时间
                lastTime: new Date(),
            }
            insertGroupMember(fdata);
        }
        // 创建成功
        res.send({ status: 200 });
    }).catch(function onRejected(error) {
        res.send(error);
    })
}
// 添加群成员
function insertGroupMember(data) {
    var groupmember = new GroupMember(data);

    groupmember.save().then(res => {
        console.log('success!');
    }).catch(err => {
        res.send({ status: 500 });
    })
}

//按要求获取群列表
/*
exports.getGroup1 = function (uid, res) {
    let query = GroupMember.find({});
    // 查询条件
    query.where({ 'userID': uid });
    // 查找groupID 关联的group对象
    query.populate('groupID');
    // 排序方式 倒序（从大到小）
    query.sort({ 'lastTime': -1 });
    // 查询结果
    query.exec().then(function (e) {
        let result = e.map(ver => {
            return {
                id: ver.groupID._id,
                name: ver.groupID.name,
                nickname: ver.name,
                imgurl: ver.groupID.imgurl,
                lastTime: ver.lastTime,
                tip: ver.tip,
                type: 1,
            }
        })
        res.send({ status: 200, result });
    }).catch(err => {
        res.send({ status: 500 });
    })
}*/

function getGroup(uid) {
    return new Promise(function (resolve, reject) {
        let query = GroupMember.find({});
        // 查询条件
        query.where({ 'userID': uid });
        // 查找groupID 关联的group对象
        query.populate('groupID');
        // 排序方式 倒序（从大到小）
        query.sort({ 'lastTime': -1 });
        // 查询结果
        query.exec().then(function (e) {
            let result = e.map(ver => {
                return {
                    id: ver.groupID._id,
                    name: ver.groupID.name,
                    imgurl: ver.groupID.imgurl,
                    lastTime: ver.lastTime,
                    tip: ver.tip,
                    type: 1,
                }
            })
            resolve(result);
        }).catch(err => {
            reject({ status: 500 });
        })
    })
}

function getOneGroupMsg(gid) {
    return new Promise(function (resolve, reject) {
        let query = GroupMsg.findOne({});
        // 查询条件
        query.where({ 'groupID': gid });
        // 关联的user对象
        query.populate('userID');
        // 排序方式 倒序（从大到小）
        query.sort({ 'time': -1 });
        // 查询结果
        query.exec().then(function (ver) {
            let result = {
                message: ver.message,
                time: ver.time,
                types: ver.types,
                name: ver.userID.name,
                fromId: ver.userID._id,
            }
            resolve(result);
        }).catch(err => {
            reject({ status: 500 });
        })
    })
}

// 添加群消息
exports.insertGroupMsg = function (uid, gid, msg, type, res) {
    let data = {
        userID: uid,
        groupID: gid,
        message: msg,
        types: type,
        time: new Date(),
    }

    let message = new GroupMsg(data);

    message.save().then(() => {
        if (res) {
            res.send({ status: 200 });
        }
    }).catch((err) => {
        if (res) {
            res.send({ status: 500 });
        }
    })
}

// 按要求获取一条群消息
/*
exports.getOneGroupMsg1 = function (gid, res) {
    let query = GroupMsg.findOne({});
    // 查询条件
    query.where({ 'groupID': gid });
    // 关联的user对象
    query.populate('userID');
    // 排序方式 倒序（从大到小）
    query.sort({ 'time': -1 });
    // 查询结果
    query.exec().then(function (ver) {
        let result = {
            message: ver.message,
            time: ver.time,
            types: ver.types,
            name: ver.userID.name,
        }
        res.send({ status: 200, result });
    }).catch(err => {
        res.send({ status: 500 });
    })
}
*/

async function gdoIt(data, res) {
    let result, bb, err;
    [err, result] = await getGroup(data.uid).then(data => [null, data]).catch(err => [err, null])
    // console.log(result);
    for (var i = 0; i < result.length; i++) {
        await getOneGroupMsg(result[i].id).then(data => bb = data).catch(err => err = err)
        if (bb) {
            if (bb.types == 0) {
                // 文字
            } else if (bb.types == 1) {
                // 图片
                bb.message = '[图片]';
            } else if (bb.types == 2) {
                // 音频
                bb.message = '[语音]';
            } else if (bb.types == 3) {
                // 位置
                bb.message = '[位置]';
            }
            result[i].msg = bb.message;
            result[i].lastTime = bb.time;
            result[i].fromName = bb.name;
            result[i].fromId = bb.fromId;
        }
    }
    if (err) {
        res.send(err);
    } else {
        res.send({ status: 200, result });
    }
}
exports.getGroups = function (data, res) {
    gdoIt(data, res)
}

// 更新群最后通讯时间
exports.updategLastTime = function (data) {
    let wherestr = { 'userID': data.uid, 'groupID': data.gid };
    let updatestr = { 'lastTime': new Date() };

    GroupMember.updateMany(wherestr, updatestr).then(result => {
        // res.send({ status: 200 });
    }).catch(err => {
        // res.send({ status: 500 });
        console.log(err);
    })
}

// 群消息未读数修改
exports.updateGroupMsgState = function (data, res) {
    // 修改项条件
    let wherestr = { 'userID': data.uid, 'groupID': data.gid };
    // 修改内容
    let updatestr = { 'tip': data.tip };

    GroupMember.updateOne(wherestr, updatestr).then(result => {
        if (res) {
            res.send({ status: 200 });
        }
    }).catch(err => {
        if (res) {
            res.send({ status: 500 });
        }
    })
}

// 消息操作
// 分页获取一对一聊天数据
exports.msg = function (data, res) {
    // data:uid fid nowPage pageSize
    // 跳过的页数
    let skipNum = data.nowPage * data.pageSize;

    let query = Message.find();
    // 查询条件
    query.where({ $or: [{ 'userID': data.uid, 'friendID': data.fid }, { 'userID': data.fid, 'friendID': data.uid }] });
    // 排序方式 倒序（从大到小）
    query.sort({ 'time': -1 });
    // 查找关联对象
    query.populate('userID');
    // 跳过条数
    query.skip(skipNum);
    // 一页条数
    query.limit(data.pageSize);
    // 查询结果
    query.exec().then(e => {
        let result = e.map(function (ver) {
            return {
                id: ver._id,
                message: ver.message,
                time: ver.time,
                types: ver.types,
                fromId: ver.userID._id,
                imgurl: ver.userID.imgurl,
            }
        })
        res.send({ status: 200, result });
    }).catch(err => {
        res.send({ status: 500 });
    })
}

// 分页获取群聊天数据
exports.gmsg = function (data, res) {
    // data:uid gid nowPage pageSize
    // 跳过的页数
    let skipNum = data.nowPage * data.pageSize;

    let query = GroupMsg.find();
    // 查询条件
    query.where({ 'groupID': data.gid });
    // 排序方式 倒序（从大到小）
    query.sort({ 'time': -1 });
    // 查找关联对象
    query.populate('userID');
    // 跳过条数
    query.skip(skipNum);
    // 一页条数
    query.limit(data.pageSize);
    // 查询结果
    query.exec().then(e => {
        let result = e.map(function (ver) {
            return {
                id: ver._id,
                message: ver.message,
                time: ver.time,
                types: ver.types,
                fromId: ver.userID._id,
                imgurl: ver.userID.imgurl,
            }
        })
        res.send({ status: 200, result });
    }).catch(err => {
        res.send({ status: 500 });
    })
}
