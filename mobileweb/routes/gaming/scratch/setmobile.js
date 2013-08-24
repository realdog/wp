var crypto = require('crypto');
var xss = require("xss");
var activity = require("../../../../proxy/mobileweb/index.js");
var _errResponse = require("../../../../utility/report").errResponseByJSON;
exports.name = "setmobile";

exports.run = function(req, res, next){
    resource.pool.getConnection(function(err, connection){
        if (!!err) {
            return _errResponse(req, res, err, connection);
        } else {
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
                            return _errResponse(req, res, new Error("scratch setmobile code is " + code + " And req.c is" + req.c), connection);
                        } else {
                            if((!!req.body.sncode) && (!!req.body.tel)) {
                                var tel = xss(req.body.tel);
                                var sncode = xss(req.body.sncode);

                                activity.setSNTableData(connection, {user_mobile:tel}, req.u, sncode, req.a, function(err, result){
                                    connection.end();
                                    if (!!err) {
                                        return _errResponse(req, res, e);
                                    } else {
                                        res.json(200,{
                                            success: true
                                        })
                                    }
                                });
                            } else {
                                connection.end();
                                return _errResponse(req,res , new Error("setMobile fail for wrong params"));
                            }
                        }

                    } else {
                        if (results.length > 1) {
                            return _errResponse(req, res, new Error("getDataFromIdentifierByCWA results length > 1"), connection);
                        } else {
                            return _errResponse(req, res, new Error(" getDataFromIdentifierByCWA results length < 1"), connection);
                        }

                    }
                }
            })
        }
    });

};
