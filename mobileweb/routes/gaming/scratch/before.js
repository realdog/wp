var activity = require("../../../../proxy/mobileweb/index.js");
var report = require("../../../../utility/report");

exports.name = "before";

exports.run = function(req, res, next){
    resource.pool.getConnection(function(err, connection){
        if (!err) {
            activity.getDataFromActivityByBaidAndWuid(connection, req.w, req.a, function(err, results){
                connection.end();
                if (!!err) {
                    return report.errResponseByHtml(req, res, err);
                } else {
                    if (results.length > 0 ) {
                        try {
                            var data = JSON.parse(results[0]["data"]);
                        } catch (e) {
                            return report.errResponseByHtml(req, res, e);
                        }
                        return  res.render("gaming/scratch/before",{
                            resourceDomain: req.resource_domain,
                            desc: data.before.summary,
                            cover: data.before.cover,
                            provider: provider
                        });
                    } else {
                        return report.errResponseByHtm(req, res, new Error(" getDataFromActivityByBaidAndWuid results length < 1"));
                    }

                }
            });
        }
    });


};