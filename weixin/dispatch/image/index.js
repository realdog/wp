var xss = require("xss");
var userSend = require('../../../proxy/weixin/logUserSend.js');
module.exports.do = function (message, req, res, cb) {
    var wuid = req.wuid >>> 0;
    var logInfo = {userkey:xss(message.FromUserName), msgtype: '图片', wuid: wuid};
    logInfo.content = "图片链接:" + xss(message.PicUrl);
    userSend.logUserSendContent(logInfo, function(err, result){
        if (!!err) {

        }
        cb(err, result);
    });
};
