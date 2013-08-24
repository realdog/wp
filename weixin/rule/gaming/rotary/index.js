var activity  = require("../../../../proxy/weixin/index.js");
var util = require('util');
module.exports = function(data, wuid, userId, activityData, callback){
    var now = new Date().getTime();
    var msg = undefined;
    if ((data.beginTime <= now) && (data.endTime > now)) {
        msg = "running";
    } else if (data.beginTime >= now) {
        msg = "before";
    } else if (data.endTime <= now) {
        msg = "after";
    } else {
        msg = undefined;
    }
    var _random = Math.floor(Math.random()*10000+1);
    if (msg == "running" || msg == "before"){
        if  (!!data[msg].cover)  {
            if (msg == "before") {
                data[msg].url =   "/gaming/rotary/" + msg + "?c=" + _random + "&w=" + wuid  + "&u=" + userId  + "&a=" + activityData["id"];
                return callback(undefined, [{
                    title: data[msg].title
                    ,description: data[msg].summary
                    ,picUrl: data[msg].cover
                    ,url: data[msg].url
                }]);
            } else if (msg == "running") {
                activity.genUserCode(wuid, userId, activityData, function(err, code){
                    if (!err) {
                        data[msg].url =   "/gaming/rotary/" + msg + "?c=" + code + "&w=" + wuid + "&u=" + userId  + "&a=" + activityData["id"];
                        return callback(err, [{
                            title: data[msg].title
                            ,description: data[msg].summary
                            ,picUrl: data[msg].cover
                            ,url: data[msg].url
                        }]);
                    } else {
                        return callback(err);
                    }
                });
            } else {
                return callback(new Error("rotary:error msg type and info"));
            }
        } else {
            return callback(new Error("cant find picUrl/cover" + util.inspect(msg, { showHidden: true, depth: null })), msg);
        }
    } else if (msg == "after"){
        var _random = Math.floor(Math.random()*100000000+1);
        return callback(undefined, [{
            title:   "活动已经结束"
            ,description:  "请您下次关注我们"
            ,picUrl: "/upload/activityPic/default/5_3.jpg"
            ,url: "/gaming/rotary/" + msg + "?c=" + _random + "&w=" + wuid  + "&u=" + userId + "&a=" +  activityData["id"]
        }]);

    } else {
        return callback(new Error("no block match"));
    }
};