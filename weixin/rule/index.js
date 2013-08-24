var gaming = require('./gaming');
var reg = require('./reg');
var exchange = require('./exchange');
var user = require('../../proxy/weixin/user.js');
var user = require('../../proxy/weixin/user.js');
var activity = require('../../proxy/weixin/index.js');


var _getActivityType = function(data) {
    var obj = undefined;
    if (data.activity_type == "gaming") {
        obj = gaming;
    } else if (data.activity_type == "reg") {
        obj = reg;
    } else if (data.activity_type == "exchange") {
        obj = exchange;
    }
    return obj;
}

var _goAction = function(keyword, wuid, userId, callback) {
    activity.getActivityByKeywordAndWuid(keyword, wuid, function(err, results) {
        if (!err) {
            if (results.length == 1) {
                try {
                    var data = JSON.parse(results[0]["data"]);
                } catch (e) {
                    return callback(new Error("parse json fail!!!!!"));
                }

                if (typeof data == 'object') {
                    var obj = _getActivityType(data);

                    if ((!!obj) && (!!data.sub_type)) {
                        return obj[data.sub_type](data, wuid, userId, results[0], callback);
                    } else {
                        return callback(new Error("obj为:" + util.inspect(data, { showHidden: true, depth: null }) + " && data.sub_type为" + util.inspect(data.sub_type, { showHidden: true, depth: null })));
                    }
                } else {
                    return callback(new Error("data is not object:" + (typeof data)));
                }
            } else {
                if (!!results && results.length >1) {
                    return callback(new Error("find too many recorder"));
                } else {
                    activity.getArticleFromDBByKeywordAndWuid(wuid, userId, keyword, function(error, results){
                        if (!!error) {
                            if (error.message == "no this keyword") {
                                activity.getDefaultMsg(undefined, wuid, userId, function(err, results){
                                    if (!!err) {
                                        return callback(err, undefined);
                                    } else {
                                        return callback(undefined, results);
                                    }
                                });
                            } else {
                                return callback(error, results);
                            }
                        } else {
                            if (typeof results == 'string') {
                                return callback(error, results);
                            }

                            if ((!!results) && (results.length > 0)) {
                                return callback(error, results);
                            } else {
                                activity.getDefaultMsg(undefined, wuid, userId, function(err, results){
                                    if (!!err) {
                                        return callback(err, undefined);
                                    } else {
                                        return callback(undefined, results);
                                    }
                                });
                                //return callback(undefined, "亲，木有这个关键词哦");
                            }
                        }
                    });
                }

            }
        } else {
            return callback(undefined, "没有这个活动的说");
        }
    });
}

module.exports.do = function(type, wuid, userkey, keyword, callback){
    if (type == 'event') {
        if (keyword.sub_type == "subscribe") {
            return reg["subscribe"](wuid, userkey, callback);
        } else if (keyword.sub_type == "unsubscribe"){
            return reg["unsubscribe"](wuid, userkey, callback);
        } else if (keyword.sub_type == "CLICK") {
            return _goAction(keyword.key, wuid, userkey, callback);
        }
    }

    resource.pool.getConnection(function(err, connection){
        if (!err) {
            user.checkUser(connection, wuid, userkey, function(err, result){
                if (!err) {
                    if (result.length == 0) {
                        user.createUser(connection, wuid, userkey, function(err, insertId){
                            connection.end();
                            if (!err) {
                                _goAction(keyword, wuid, insertId, callback);
                            } else {
                                return callback(new Error("createUser fail"));
                            }
                        });
                    } else if (result.length == 1){
                        connection.end();
                        var userId = result[0]["id"];
                        _goAction(keyword, wuid, userId, callback);
                    } else {
                        connection.end();
                        return callback(new Error("checkuser find too many user"));
                    }
                }
            });
        } else {
            return callback(new Error("get connection fail"));
        }
    });
};
