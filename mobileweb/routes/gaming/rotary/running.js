var activity = require("../../../../proxy/mobileweb/index.js");
var crypto = require('crypto');
var _errResponse = require("../../../../utility/report").errResponseByHtml;
exports.name = "running";
exports.run = function(req, res, next){
    resource.pool.getConnection(function(err, connection){
        if (!err) {
            activity.getDataFromActivityByBaidAndWuid(connection, req.w, req.a, function(err, results){
                if (!!err) {
                    return _errResponse(req, res, err, connection);
                } else {
                    if (results.length == 1) {
                        try {
                            var data = JSON.parse(results[0]["data"]);
                        } catch (e) {
                            return _errResponse(req, res, e, connection);
                        }

                        var str = req.w.toString() + req.u.toString() + req.a.toString() + results[0]["salt"].toString();
                        var hash =crypto.createHash("md5");
                        hash.update(str);
                        var hashmsg = hash.digest('hex');
                        var code = hashmsg.toString();
                        if (code != req.c) {
                            return _errResponse(req, res, new Error("code is " + code + " And req.c is" + req.c), connection);
                        }

                        if (data.endTimer <= new Date().getTime) {
                            connection.end();
                            return  res.render("gaming/rotary/after",{
                                resourceDomain: req.resource_domain,
                                desc: "活动已经结束",
                                provider: provider
                            });
                        } else if (data.beginTime > new Date().getTime()) {
                            connection.end();
                            return res.render("gaming/rotary/before",{
                                resourceDomain: req.resource_domain,
                                desc: data.running.summary,
                                provider: provider
                            });
                        }
                        activity.getSN(connection, req.u, req.a, function(err, result){
                            connection.end();
                            if (!err) {
                                try {
                                    var _other = JSON.parse(result.other);
                                } catch (e) {
                                    return _errResponse(req, res, e, undefined);
                                }

                                return res.render("gaming/rotary/win",{
                                    resourceDomain: req.resource_domain,
                                    sn: result.sn,
                                    prizetype: _other.prizetype,
                                    prizename: _other.prizename,
                                    desc: data.running.summary,
                                    provider: provider
                                });
                            } else {
                                return  res.render("gaming/rotary/running",{
                                    resourceDomain: req.resource_domain,
                                    desc: data.running.summary,
                                    prize: data.prize,
                                    code: req.c,
                                    w: req.w,
                                    u: req.u,
                                    a: req.a,
                                    businessUser: req.businessUser,
                                    provider: provider
                                });
                               /*
                                util.getUserTodayJoinTimes(connection, userkey, req.w, req.a, function(err, results){
                                    if (!!err) {
                                        return _errResponse(req, res, err, connection);
                                    } else {
                                        if (results.length > 0) {
                                            var times = results[0]["times"];
                                            if (times >= data.timesPreDU) {
                                                connection.end();
                                                return res.render("gaming/rotary/error",{
                                                    resourceDomain: req.resource_domain,
                                                    desc: "亲，您今日的参与次数已经用完了，请明日再来吧！",
                                                    provider: provider
                                                });
                                            }  else {
                                                util.getUserJoinTimes(connection, userkey, req.w, req.a, function(err, results){
                                                    if (!!err) {
                                                        return _errResponse(req, res, err, connection);

                                                    } else {
                                                        if (results.length > 0) {
                                                            var times = parseInt(results[0]["times"]);
                                                            if (times >= data.timesPreUser)  {
                                                                connection.end();
                                                                return res.render("gaming/rotary/error",{
                                                                    resourceDomain: req.resource_domain,
                                                                    desc: "亲，您的参与次数已经用完了，请期待下次活动！",
                                                                    provider: provider
                                                                });
                                                            } else {
                                                                util.userJoinActivity(connection,userkey, req.w, req.a, function(err, result){
                                                                    if (!!err){
                                                                        return _errResponse(req, res, err, connection);
                                                                    } else {
                                                                        connection.end();
                                                                        return  res.render("gaming/rotary/running",{
                                                                            resourceDomain: req.resource_domain,
                                                                            desc: data.running.summary,
                                                                            prize: data.prize,
                                                                            code: req.c,
                                                                            u: req.u,
                                                                            a: req.a,
                                                                            provider: provider
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }); */
                            }
                        });
                    } else {
                        if (results.length > 1) {
                            return _errResponse(req, res, new Error(" getDataFromActivityByBaidAndWuid results length > 1"), connection);
                        } else {
                            return _errResponse(req, res, new Error(" getDataFromActivityByBaidAndWuid results length < 1"), connection);
                        }

                    }
                }
            });
        } else {
            return  _errResponse(req, res, err, connection);
        }
    });
};