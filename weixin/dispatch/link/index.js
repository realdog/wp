var xss = require("xss");
var userSend = require('../../../proxy/weixin/logUserSend.js');
module.exports.do = function (message, req, res, cb) {
    var wuid = req.wuid >>> 0;
    var logInfo = {userkey:xss(message.FromUserName), msgtype: "链接", wuid: wuid};
    logInfo.content = "标题:" + xss(message.Title);
    logInfo.content += "\n 描述:" + xss(message.Description);
    logInfo.content += "\n 链接:" + xss(message.Url);
    userSend.logUserSendContent(logInfo, function(err, result){
        if (!!err) {

        }
        cb(err, result);
    });
};
