var activity = require("../../../../proxy/mobileweb/index.js");
var report = require("../../../../utility/report");

exports.name = "before";

exports.run = function(req, res, next){
    resource.pool.getConnection(function(err, connection){
        if (!err) {
            activity.getDataFromActivityByBaidAndWuid(connection, req.w, req.a, function(err, results){
                if (!!err) {
                    connection.end();
                    return report.errResponseByHtml(req, res, err);
                } else {
                    try {
                        var data = JSON.parse(results[0]["data"]);
                    } catch (e) {
                        return report.errResponseByHtml(req, res, e);
                    }
                    return  res.render("gaming/rotary/before",{
                        resourceDomain: req.resource_domain,
                        desc: data.before.summary,
                        cover: data.before.cover,
                        provider: provider
                    });
                }
            });
        }
    });


};