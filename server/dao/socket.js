let dbserver = require('./dbserver')

module.exports = function (io) {
    // 用户对象中有用户名和用户id，这个用户id就是socket.id
    var users = {};       //socket注册用户
    io.on('connection', socket => {
        // 用户登录注册
        socket.on('login', (id) => {
            socket.name = id;
            users[id] = socket.id;
            // 回复客户端
            socket.emit('login', socket.id);
        });

        // 用户一对一消息发送
        socket.on('msg', (msg, fromid, toid) => {
            console.log(msg);
            // 修改好友最后通讯时间
            dbserver.updatefLastTime({ uid: fromid, fid: toid })
            // 存储一对一消息
            dbserver.insertMsg(fromid, toid, msg.message, msg.types)

            // 只发送给接收者
            if (users[toid]) {
                socket.to(users[toid]).emit('msg', msg, fromid, 0);
            }
            // 只发送给自己
            socket.emit('msg', msg, toid, 1);
        });

        // 用户离开
        socket.on('disconnecting', () => {
            if (users.hasOwnProperty(socket.name)) {
                delete users[socket.name];
            }
        });

        // 加入群
        socket.on('group', function (data) {
            socket.join(data);
        });
        // 接收群消息
        socket.on('groupmsg', function (msg, fromid, gid, uname, img) {
            // 修改好友最后通讯时间
            dbserver.updategLastTime({ uid: fromid, gid: gid })
            // 存储群消息   uid, gid, msg, type, res
            dbserver.insertGroupMsg(fromid, gid, msg.message, msg.types)

            // 群内广播消息，发给除发送者外的所有人
            socket.to(gid).emit('groupMsg', msg, fromid, gid, uname, img, 0);
            // 只发给发言者
            socket.emit('groupMsg', msg, fromid, gid, uname, img, 1);
        })
        // 接收未读消息数
        socket.on('tip', function (uid, gid, tip) {
            // 修改用户的未读消息数
            dbserver.updateGroupMsgState({ uid: uid, gid: gid, tip: tip })
        })

        // 告知离开当前聊天页面
        socket.on('leaveChat', function (uid, fid) {
            // 消息标为已读
            dbserver.updateMsgState({ uid: fid, fid: uid });
            dbserver.updateGroupMsgState({ uid: uid, gid: fid, tip: 0 });

            socket.emit('leavechat', uid, fid)
        })
    });
}