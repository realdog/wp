var activity = require("../../../../proxy/mobileweb/index.js");
var report = require("../../../../utility/report");
exports.name = "after";

exports.run = function(req, res, next){
    pool.getConnection(function(err, connection){
        if (!err) {
            util.getDataFromActivityByBaid(connection, req.a, function(err, results){
                if (!!err) {
                    connection.end();
                    return report.errResponseByHtml(req, res, err, undefined);
                } else {
                    if (results.length >= 1) {
                        try {
                            var data = JSON.parse(results[0]["data"]);
                        } catch (e) {
                            return report.errResponseByHtml(req, res, e, undefined);
                        }
                        return  res.render("exchange/free/after",{
                            resourceDomain: req.resource_domain,
                            desc: data.after.summary,
                            cover: data.after.cover,
                            provider: provider
                        });
                    } else {
                        return res.redirect("");
                    }
                }
            });
        }
    });
};