var rule = require('../../rule');
var userSend = require('../../../proxy/weixin/logUserSend.js');
var xss = require("xss");
module.exports.do = function (message, req, res, callback) {
    for (var key in message) {
        message[key] = xss(message[key]);
    }
    var event = message.Event;
    var key = message.EventKey;
    var userkey = message.FromUserName;
    var wuid = req.wuid >>> 0;


    var logInfo = {userkey:message.FromUserName, msgtype:"消息", wuid: wuid};
    logInfo.content = "消息类型:" + event;
    logInfo.content += "\n 键值:" + key;
    userSend.logUserSendContent(logInfo, function(err, result){
        if (!!err) {

        }
        rule.do('event', wuid, userkey, { sub_type: event, key: key}, function(err, msg){
            callback(err, msg);
        });
    });
};
