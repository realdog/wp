var rule = require('../../rule');
var userSend = require('../../../proxy/weixin/logUserSend.js');
var xss = require('xss');
module.exports.do = function (message, req, res, callback) {
    var content = xss(message.Content);
    var userkey = xss(message.FromUserName);
    var wuid = req.wuid >>> 0;
    var logInfo = {
        userkey:xss(message.FromUserName),
        msgtype: "文本",
        wuid: wuid,
        content: "文本:" + content
    };
    userSend.logUserSendContent(logInfo, function(err, result){
        if (!!err) {
        }
        rule.do('text', wuid, userkey, content, function(err, msg){
            callback(err, msg);
        });
    });

};
