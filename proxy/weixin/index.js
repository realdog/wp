var crypto = require('crypto');


var _getActivityDataByKeyword = function(keyword, wuid, callback){
    var sql = "SELECT baid as id, salt, config as data FROM biz_activity where  keyword = ? AND wuid = ?AND status = 0";
    var obj =  [keyword, wuid];
    _query(undefined, sql, obj, function(err, results){
        callback(err, results);
    });
};
exports.getActivityDataByKeyword = _getActivityDataByKeyword;



var _getWelcomMsg = function(connection,  wuid, userId, cb) {
    var sql = "select welcome from biz_user where wuid = ?";
    var obj = [wuid];
    _query(connection, sql, obj, function(err, results){
        if (!!err) {
            return cb(err, undefined);
        } else {
            if (!!results && (results.length == 1)) {

                try {
                    var welcome = JSON.parse(results[0].welcome);
                } catch (e) {
                    cb(e, undefined);
                }
                if (welcome.type == "0") {
                    return cb(undefined, welcome.text);
                } else if (welcome.type == "1") {
                    var articleid = welcome.pic >>> 0;
                    _getArticleById(connection, wuid, userId, articleid, function(err, results){
                        if (!!err) {
                            return cb(err, undefined);
                        } else {
                            return cb(undefined, results);
                        }
                    });
                } else {

                }


            } else {
                return cb(new Error("get biz user welcome msg fail"), undefined);
            }
        }
    });
};
exports.getWelcomMsg = _getWelcomMsg;

var _getDefaultMsg = function(connection, wuid, userId, cb) {
    var now = new Date().getTime();
    if (resource.hasOwnProperty("defaultMsg") && resource.hasOwnProperty("defaultMsg_updatetime")) {
        if ((now - resource.defaultMsg_updatetime[wuid]) < 360) {
            var results = resource.defaultMsg[wuid];
            var type = resource.defaultMsg_type[wuid];
            if (type == "String") {
                return cb(undefined, results);
            } else if (type == "Array") {
                var __temp = [];
                //__temp = results.slice(0, results.length >>> 0);
                for (var _temp in results) {
                    __temp[_temp] = {};
                    __temp[_temp].title = results[_temp].title;
                    __temp[_temp].picUrl = results[_temp].picUrl;
                    __temp[_temp].content = results[_temp].content;
                    __temp[_temp].url = results[_temp].url;
                    __temp[_temp].description = results[_temp].desc;
                }
                return cb(undefined, __temp);
            } else {
                return cb(new Error("cached msg wrong"));
            }
        }

    }
    var sql = "select defaultmsg from biz_user where wuid = ?";
    var obj = [wuid];
    _query(connection, sql, obj, function(err, results){
        if (!!err) {
            return cb(err, undefined);
        } else {
            if (!!results && (results.length == 1)) {

                try {
                    var defaultmsg = JSON.parse(results[0].defaultmsg);
                } catch (e) {
                    cb(e, undefined);
                }
                if (defaultmsg.type == "0") {
                    resource.defaultMsg_type[wuid] = "String";
                    resource.defaultMsg[wuid] = defaultmsg.text;
                    resource.defaultMsg_updatetime[wuid] = new Date().getTime();
                    return cb(undefined, defaultmsg.text);
                } else if (defaultmsg.type == "1") {
                    var articleid = defaultmsg.pic >>> 0;
                    _getArticleById(connection,  wuid, userId, articleid, function(err, results){
                        if (!!err) {
                            return cb(err, undefined);
                        } else {
                            resource.defaultMsg_type[wuid] = "Array";
                            resource.defaultMsg[wuid] = results.slice(0, results.length >>> 0);
                            resource.defaultMsg_updatetime[wuid] = new Date().getTime();
                            return cb(undefined, results);
                        }
                    });
                } else {

                }
            } else {
                return cb(new Error("get biz user welcome msg fail"), undefined);
            }
        }
    });
};
exports.getDefaultMsg = _getDefaultMsg;



var _getAllDefaultMsg = function(connection, cb) {

    var sql = "select wuid, defaultmsg from biz_user";
    var obj = [];
    _query(connection, sql, obj, function(err, results){
        if (!!err) {
            return cb(err, undefined);
        } else {
            var articleList = [];
            var defaultMsg = {};
            for (var _index = 0; _index < results.length; _index++ ) {
                try {
                    var defaultmsg = JSON.parse(results[_index].defaultmsg);
                    var wuid = results[_index].wuid;
                } catch (e) {
                    cb(e, undefined);
                }
                if (defaultmsg.type == "0") {
                    defaultMsg[wuid] = defaultmsg.text;
                } else if (defaultmsg.type == "1") {
                    var articleid = defaultmsg.pic >>> 0;
                    articleList.push(articleid);
                } else {

                }
            }
            /*
            _getArticleById(connection, wuid, userid,  articleid, function(err, results){
                if (!!err) {
                    return cb(err, undefined);
                } else {
                    resource.defaultMsg_type[wuid] = "Array";
                    resource.defaultMsg[wuid] = results.slice(0, results.length >>> 0);
                    resource.defaultMsg_updatetime[wuid] = new Date().getTime();
                }
            });
            */
            if (articleList.length > 0) {
                _getArticleByList(connection, articleList.join(','), function(err, results){
                    if (!!err) {
                        return cb(err, undefined);
                    } else {
                        for (_temp in results) {
                            defaultMsg[_temp] = results[_temp].slice(0, results[_temp].length);
                        }
                        return cb(undefined, defaultMsg);
                        /*                    for (var _index = 0; _index < results.length; _index++) {
                         resource.defaultMsg_type[results[_index]["wuid"]] = "Array";
                         resource.defaultMsg[results[_index]["wuid"]] = results[_index]["jsondata"].slice(0, results.length >>> 0);
                         resource.defaultMsg_updatetime[results[_index]["wuid"]] = new Date().getTime();
                         }*/
                    }
                });
            } else {
                return cb(undefined, defaultMsg);
            }



        }
    });
};
exports.getAllDefaultMsg = _getAllDefaultMsg;


var _getArticleByList = function(connection, articleidList, cb) {
    var sql = "select  biz_article.wuid, biz_article.aid, biz_article.type, biz_article.jsondata  from biz_article where  aid in (" + articleidList + ") ";
    var obj = [];
    _query(connection, sql  , obj, function(err, results){
        if (!!err) {
            return cb(err, undefined);
        } else {
            if (results.length > 0) {
                var defaultMsg = {};
                for (var _index = 0; _index < results.length; _index++) {
                    var article = [];
                    try {
                        var data =  JSON.parse(results[_index].jsondata);
                    } catch (e) {
                        return callback(e, undefined);
                    }
                    if (results[0].type == "s") {
                        article[0] = {};
                        article[0].title = data.title;
                        article[0].picUrl = data.coverurl;
                        article[0].content = data.maincontent;
                        article[0].url = data.source_url || "/reply/normal/showArticle?c=0&u=0&w=" + results[_index]["wuid"] + "&a=" + results[_index]["aid"];
                        article[0].description = data.summary;
                    } else if (results[0].type == "m") {
                        var ___temp;
                        for (___temp in data) {
                            article[___temp] = {};
                            article[___temp].title = data[___temp].title;
                            article[___temp].picUrl = data[___temp].cover;
                            article[___temp].content = data[___temp].content;
                            article[___temp].url = data[___temp].sourceurl || "/reply/normal/showArticle?c="+___temp+"&u=0&w=" + results[_index]["wuid"] + "&a=" + results[_index]["aid"];
                            article[___temp].description = "";
                        }
                    }
                    defaultMsg[results[_index].wuid] = article.slice(0, article.length);
                }
                return cb(err, defaultMsg);
            } else {
                return cb(new Error("Canot find recorder"), undefined);
            }
        }
    });
}

var _getArticleById = function(connection, wuid, userId, articleid, cb) {
    var sql = "select  biz_article.aid, biz_article.type, biz_article.jsondata  from biz_article where wuid = ? AND aid = ?"
    var obj = [wuid, articleid];
    _query(connection, sql  , obj, function(err, results){
        if (!!err) {
            return cb(err, undefined);
        } else {
            if (results.length == 1) {

                var article = [];
                try {
                    var data =  JSON.parse(results[0].jsondata);
                } catch (e) {
                    return callback(e, undefined);
                }

                if (results[0].type == "s") {
                    article[0] = {};
                    article[0].title = data.title;
                    article[0].picUrl = data.coverurl;
                    article[0].content = data.maincontent;
                    article[0].url = data.source_url || "/reply/normal/showArticle?c=0&u=0&w=" + wuid + "&a=" + results[0]["aid"];
                    article[0].description = data.summary;
                } else if (results[0].type == "m") {
                    var ___temp;
                    for (___temp in data) {
                        article[___temp] = {};
                        article[___temp].title = data[___temp].title;
                        article[___temp].picUrl = data[___temp].cover;
                        article[___temp].content = data[___temp].content;
                        article[___temp].url = data[___temp].sourceurl || "/reply/normal/showArticle?c="+___temp+"&u=0&w=" + wuid + "&a=" + results[0]["aid"];
                        article[___temp].description = "";
                    }
                }
                return cb(err, article);
            } else if (results.length == 0) {
                return cb(new Error("Canot find recorder"), undefined);
            } else {
                return cb(new Error("Canot too many recorder"), undefined);
            }
        }
    });


};
exports.getArticleById = _getArticleById;


exports.getBizUserByApi = function(connection, api, cb){
    var sql = "select * from biz_user where api = ?";
    var obj = [api];
    _query(connection, sql, obj, function(err ,result){
        return cb(err, result);
    });

};

exports.getBizUserByToken = function(connection, token, cb){
    var sql = "select * from biz_user where token = ?";
    var obj = [token];
    _query(connection, sql, obj, function(err ,result){
        return cb(err, result);
    });

};

exports.getBizUserByWuid = function(connection, wuid, cb){
    var sql = "select * from biz_user where wuid = ?";
    var obj = [wuid];
    _query(connection, sql, obj, function(err ,result){
        return cb(err, result);
    });

};


//--------------------------------------------------------

var _getSN = function(connection, data, baid,  callback) {
    var fieldList = [];
    var valueList = []
    if (!connection) {
        return callback(new Error("get connection fail"));
    }

    if (typeof data == "string") {
        var sql = "select sid as id, sn, other from biz_sn where baid = ? and userkey = ?";
        var obj = [baid, data];
        _query(connection, sql, obj, function(err, results){
            connection.end();
            if (!!err) {
                return callback(new Error("select error"));
            } else {
                if (results.length == 1) {
                    return callback(undefined, {sn:results[0]["sn"], id: results[0]["id"], other: results[0]["other"]});
                } else if (results.length > 1) {
                    return callback(new Error("find too many recorder"), results.length);
                } else {
                    return callback(new Error("find zero recorder"), 0);
                }
            }
        });
    } else {
        for (var _temp in data) {
            fieldList.push(_temp + " = ?");
            valueList.push(data[_temp]);
        }

        if (fieldList.length == 0 || valueList.length == 0) {
            return callback(new Error("NULL data"));
        }
        valueList.push(baid);
        var sql = "update biz_sn set " + fieldList.join(",")  + " , sid = LAST_INSERT_ID(sid)  where flag = 0 AND baid = ? AND userkey is null limit 1";

        _query(connection, sql, valueList, function(err, result){
            if (!!err) {
                return callback(new Error("update fail"));
            } else {
                if (result.affectedRows == 1) {
                    var id = result.insertId;
                    var sql = "select sid as id, sn, other from biz_sn where sid = ?";
                    var obj = [id];
                    _query(connection, sql, obj, function(err, results){
                        connection.end();
                        if (!!err) {
                            return callback(new Error("select error"));
                        } else {
                            if (results.length == 1) {
                                return callback(undefined, {sn:results[0]["sn"], id: results[0]["id"], other: results[0]["other"]});
                            } else if (results.length > 1) {
                                return callback(new Error("select too many recorder"), results.length);
                            } else {
                                return callback(undefined, 0);
                            }
                        }
                    });
                } else if (result.affectedRows > 1) {
                    return callback(new Error("update too many recorder"), result);
                } else {
                    return callback(new Error("update zero recorder"), result);
                }
            }
        });
    }



};

exports.getSN = _getSN;

var _checkHeader = function(str, allow) {
    return true;
}

exports.checkHeader = _checkHeader;

var _query = function(connection, sql, obj, callback){

    if (!!connection) {
        connection.query(sql, obj, function(err, results){
            callback(err, results);
        });
    }   else {
        resource.pool.getConnection(function(err, connection) {
            if (!!err) {
                return callback(err);
            } else {
                var query = connection.query(sql, obj, function(err, results){
                    connection.end();
                    callback(err, results);
                });
                console.log(query.sql);
            }
        });
    }
};
exports.query = _query;


var _getActivityByKeywordAndWuid = function(keyword, wuid, callback){
    var sql = "SELECT baid as id, config as data, salt FROM biz_activity where  keyword = ? AND wuid = ? and status = 0";
    var obj =  [keyword, wuid];
    _query(undefined, sql, obj, function(err, results){
        callback(err, results);
    });
};
exports.getActivityByKeywordAndWuid = _getActivityByKeywordAndWuid;


var _getArticleFromDBByKeywordAndWuid = function(wuid, userId, keyword, callback) {
    var accurateSql = '';
    accurateSql += ' SELECT biz_reply.qid, biz_reply.key_type, biz_reply.keyword, biz_reply.answer_type, biz_reply.answer, ';
    accurateSql += ' biz_article.aid, biz_article.type, biz_article.jsondata ';
    accurateSql += ' FROM biz_reply left join biz_article on biz_reply.answer = biz_article.aid and biz_article.flag = 0 ';
    accurateSql += ' where biz_reply.flag = 0 and biz_reply.key_type =  1';
    accurateSql += ' and biz_reply.wuid = ? and biz_reply.keyword = ? ';

    var fuzzySql = '';
    fuzzySql += ' SELECT biz_reply.qid, biz_reply.key_type, biz_reply.keyword, biz_reply.answer_type, biz_reply.answer, ';
    fuzzySql += ' biz_article.aid, biz_article.type, biz_article.jsondata ';
    fuzzySql += ' FROM biz_reply left join biz_article on biz_reply.answer = biz_article.aid and biz_article.flag = 0 ';
    fuzzySql += ' where biz_reply.flag = 0 and biz_reply.key_type =  0';
    fuzzySql += ' and biz_reply.wuid = ? and biz_reply.keyword REGEXP ? order by qid desc';



    var obj = [wuid, keyword];
    resource.pool.getConnection(function(err, connection){
        if (!err) {
            _query(connection, accurateSql  , obj, function(err, results){
                if (!err) {
                    if ((!!results) && (results.length > 0)) {
                        connection.end();
                        if (results[0].answer_type == 0) {
                            return callback(undefined, results[0].answer);
                        }
                        var returnData;
                        try {
                            var data =  JSON.parse(results[0].jsondata);
                        } catch (e) {
                            return callback(e, undefined);
                        }
                        if (results[0].type == "s") {
                            returnData = [];
                            returnData[0] = {};
                            returnData[0].title = data.title;
                            returnData[0].picUrl = data.coverurl;
                            returnData[0].content = data.maincontent;
                            returnData[0].url = data.source_url || "/reply/normal/showArticle?c=0&u=0&w=" + wuid + "&a=" + results[0].aid;
                            returnData[0].description = data.summary;
                        } else if (results[0].type == "m") {
                            var ___temp;
                            returnData = [];
                            for (___temp in data) {
                                returnData[___temp] = {};
                                returnData[___temp].title = data[___temp].title;
                                returnData[___temp].picUrl = data[___temp].cover;
                                returnData[___temp].content = data[___temp].content;
                                returnData[___temp].url = data[___temp].sourceurl || "/reply/normal/showArticle?c="+ ___temp +"&u=0&w=" + wuid + "&a=" + results[0].aid;
                                returnData[___temp].description = "";
                            }
                        }
                        return callback(err, returnData);
                    } else {
                        _query(connection, fuzzySql  , obj, function(err, results){
                            connection.end();
                            var returnData;
                            if (!!err) {
                                return callback(err, results);
                            }
                            if ((!!results) && (results.length > 0)) {
                                if (results[0].answer_type == 0) {
                                    return callback(undefined, results[0].answer);
                                }

                                try {
                                    var data =  JSON.parse(results[0].jsondata);
                                } catch (e) {
                                    return callback(e, undefined);
                                }

                                if (results[0].type == "s") {
                                    returnData = [];
                                    returnData[0] = {};
                                    returnData[0].title = data.title;
                                    returnData[0].picUrl = data.coverurl;
                                    returnData[0].content = data.maincontent;
                                    returnData[0].url = data.source_url || "/reply/normal/showArticle?c=0&u=0&w=" + wuid + "&a=" + results[0].aid;
                                    returnData[0].description = data.summary;
                                } else if (results[0].type == "m") {
                                    var ___temp;
                                    returnData = [];
                                    for (___temp in data) {
                                        returnData[___temp] = {};
                                        returnData[___temp].title = data[___temp].title;
                                        returnData[___temp].picUrl = data[___temp].cover;
                                        returnData[___temp].content = data[___temp].content;
                                        returnData[___temp].url = data[___temp].sourceurl || "/reply/normal/showArticle?c="+___temp+"&u=0&w=" + wuid + "&a=" + results[0].aid;
                                        returnData[___temp].description = "";
                                    }
                                }
                                callback(err, returnData);
                            } else {
                                callback(new Error("no this keyword"));
                            }
                        });
                    }
                } else {
                    connection.end();
                    callback(err, results);
                }
            });
        } else {
            callback(new Error("proxy index _getArticleFromDBByKeywordAndWuid fail bye get connection error"));
        }
    });

}

exports.getArticleFromDBByKeywordAndWuid = _getArticleFromDBByKeywordAndWuid;




var _genUserCode = function (wuid, userId, activityData, callback) {
    var str = wuid.toString() + userId.toString() + activityData["id"].toString() + activityData["salt"].toString();
    var hash =crypto.createHash("md5");
    hash.update(str);
    var hashmsg = hash.digest('hex');
    var code = hashmsg.toString();
    return callback(undefined, code);

};

exports.genUserCode = _genUserCode;






exports.setSNTableData = function(connection, data, userkey, sn, baid, cb){
    if (!!connection) {
        var fieldList = [];
        var valueList = [];

        for (var _temp in data) {
            fieldList.push(_temp + " = ?");
            valueList.push(data[_temp]);
        }

        if (fieldList.length == 0 || valueList.length == 0) {
            return cb(new Error("NULL data"));
        }
        valueList.push(userkey)
        valueList.push(sn);
        valueList.push(baid);
        var sql = "update biz_sn set " + fieldList.join(",")  + " , sid = LAST_INSERT_ID(sid)  where userkey = ? AND sn = ? AND baid = ?  limit 1";
        _query(connection, sql, valueList, function(err, result){
            if (!!err) {
                return cb(new Error("update fail"));
            } else {
                if (result.affectedRows == 1) {
                    cb(undefined, result.insertId);
                } else if (result.affectedRows > 1) {
                    return cb(new Error("update too many recorder"), result);
                } else {
                    return cb(new Error("update zero recorder"), result);
                }
            }
        });
    } else {
        return cb(new Error("get connection fail"));
    }
};



exports.getBizUserByToken = function(connection, token, cb){
    var sql = "select * from biz_user where token = ?";
    var obj = [token];
    _query(connection, sql, obj, function(err ,result){
        return cb(err, result);
    });

};

exports.getBizUserByWuid = function(connection, wuid, cb){
    var sql = "select * from biz_user where wuid = ?";
    var obj = [wuid];
    _query(connection, sql, obj, function(err ,result){
        return cb(err, result);
    });

};
