var activity  = require("../../../../proxy/weixin/index.js");
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
    var activityId = activityData.id;

    var _random = Math.floor(Math.random()*10000+1);
    if (!!msg) {
        if (msg != 'running') {
            data[msg].url =  "/exchange/free/" + msg + "?c=" + _random + "&u=" + userId + "&w=" + wuid + "&a=" + activityId;
            return callback(undefined, [{
                title: data[msg].title
                ,description: data[msg].summary
                ,picUrl: data[msg].cover
                ,url: data[msg].url
            }]);
        } else {
            activity.genUserCode(wuid, userId, activityData, function(err, code){
                if (!err) {
                    data[msg].url =  "/exchange/free/" + msg + "?c=" + code + "&u=" + userId +"&w=" + wuid + "&a=" + activityId;
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
        }

    } else {
        return callback(new Error("no block match"));
    }
};
