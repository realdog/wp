var xss = require("xss");
var userSend = require('../../../proxy/weixin/logUserSend.js');
module.exports.do = function (message, req, res, cb) {
    var wuid = req.wuid >>> 0;
    var logInfo = {userkey:xss(message.FromUserName), msgtype: '地理位置', wuid: wuid};
    logInfo.content = "纬度:" + xss(message.Location_X) + "  经度:" + xss(message.Location_Y);
    logInfo.content += "\n 放大倍数:" + xss(message.Scale);
    logInfo.content += "\n 地址:" + xss(message.Label);
    userSend.logUserSendContent(logInfo, function(err, result){
        if (!!err) {

        }
        cb(err, result);
    });
};
