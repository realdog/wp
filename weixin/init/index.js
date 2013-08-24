var config = require('../config')[env];
var mysql  = require('mysql');
var Logger = require('bunyan');
var activity = require('../../proxy/weixin/index.js');

module.exports.do = function(express){
    this.log = new Logger({
        name: config.log_weixin.name,
        streams: [
            {
                stream: process.stdout,
                level: 'info'
            },
            {
                type:  config.log_weixin.type,
                path:  config.log_weixin.path,
                level:  config.log_weixin.level,
                period:  config.log_weixin.period,   // daily rotation
                count:  config.log_weixin.count        // keep 365 back copies
            }
        ],
        serializers: {
            req: Logger.stdSerializers.req,
            res: Logger.stdSerializers.res
        }
    });

    var RedisStore = require('connect-redis')(express);
    this.redisStore = new RedisStore({
        host: config.redisServer.host,
        port: config.redisServer.prot,
        ttl: config.redisServer.ttl,
        db: config.redisServer.db
    });

    this.pool = mysql.createPool({
        connectionLimit: 300,
        queueLimit: 300,
        host     : config.mysql.host,
        user     : config.mysql.username,
        password : config.mysql.password,
        database  : config.mysql.db
    });
    var that = this;
    that.defaultMsg = {};
    that.defaultMsg_type = {};
    that.defaultMsg_updatetime = {};
    activity.getAllDefaultMsg(undefined, function(err, results){
        var now = new Date().getTime();
        for (_temp in results) {
            that.defaultMsg[_temp] = results[_temp];
            if (results[_temp] instanceof Array) {
                that.defaultMsg_type[_temp] = "Array";
            } else if (results[_temp] instanceof String || typeof(results[_temp]) == 'string') {
                that.defaultMsg_type[_temp] = "String";
            } else {
                that.defaultMsg_type[_temp] = typeof results[_temp];
            }
            that.defaultMsg_updatetime[_temp] = now;
        }
        console.log("load defaultMsg:" + ((!!err)? "fail" : "success"));
    });
};
