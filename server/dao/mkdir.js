// 用于新建目录
const fs = require('fs');
const path = require('path');

exports.mkdirs = function (pathname, callback) {
    // 需要判断是否是绝对路径
    pathname = path.isAbsolute(pathname) ? pathname : path.join(__dirname, pathname);
    // 获取相对路径
    pathname = path.relative(__dirname, pathname);
    let folders = pathname.split(path.sep);  // path.sep避免平台差异带来的bug
    let pre = "";
    folders.forEach(folder => {
        try {
            // 没有异常，文件已经创建，提示用户该文件已经创建
            let _stat = fs.statSync(path.join(__dirname, pre, folder));
            let hasMkdir = _stat && _stat.isDirectory();
            if (hasMkdir) {
                // 该文件已经存在，不能重复创建
                callback
            }
        } catch (err) {
            // 抛出异常，文件不存在则可创建文件
            try {
                // 避免父文件还没有创建的时候先创建子文件所出现的意外，这里选择同步创建文件
                fs.mkdirSync(path.join(__dirname, pre, folder));
                callback && callback(null);
            } catch (err) {
                callback && callback(err);
            }
        }
        // 路径拼合
        pre = path.join(pre, folder);
    });
}