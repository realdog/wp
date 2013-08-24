/*require('nodetime').profile({
    accountKey: '29dfbab8b8ddd778192b90a72e3db6492fa2ed6b', 
    appName: 'Node.js Application_1'
  });*/
env = process.env.NODE_ENV || 'production';
/**
 * Module dependencies.
 */
var util = require('util');
var List = require('wechat').List;
var graceful = require('graceful');
var express = require('express')
  , config = require('./weixin/config')[env]
  , http = require('http')
  , wechat = require('wechat')
  , weixin = require('./weixin/dispatch')
  , mysql  = require('mysql')
  , utility  = require("./utility")
  , report = require("./utility/report");
resource = require('./weixin/init');
List.add('view', [
  ['回复{a}查看我的性别', function (info, req, res) {
    res.reply('我是个妹纸哟');
  }],
  ['回复{b}查看我的年龄', function (info, req, res) {
    res.reply('我今年18岁');
  }],
  ['回复{c}查看我的性取向', '这样的事情怎么好意思告诉你啦- -']
]);
var app = express();
resource.do(express);
app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.session({
    secret: 'asdfasawefawe#@kjas12312ldasdf',
    store: resource.redisStore 
}));

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());



app.use('/weixin',function(req, res, next){
    var bKey = req.url.replace(/\?.*/, '').replace('/', '');
    if (!bKey) {
        res.writeHead(401);
        res.end('Invalid signature!');
        return;
    } else {
        utility.getBizUserByApi(undefined, bKey, function(error, result){
            if (!!error) {
                res.writeHead(402);
                res.end('Invalid signature!!');
            } else {
                if ((!result) || (result.length < 1)) {
                    res.writeHead(403);
                    return res.end('Invalid signature!!');
                }
                req.bkey = bKey;
                req.local_domain = config.local_domain;
                req.resource_domain = config.resource_domain;
                req.wechat_token = result[0]["token"];
                req.wuid = result[0]["wuid"];
                var d = require('domain').create();
                d.on('error', (function(req, res){
                    return function(er){
                        report.errResponseByXml(req, res, {message:er.stack});
                        d.dispose();
                    };
                })(req, res));
                d.add(req);
                d.add(res);
                d.run(next);
            }
        });
    }
});



    app.use('/weixin', wechat("fakeToken").text(function(message, req, res, next){
		console.log(req.wxsession);
                req.wxsession.text = message.Content;
        if (message.Content === 'list') {
            return res.wait('view');
        } 
        weixin.text.do(message, req, res, function(err, msg){
            if (!!err) {
                return report.errResponseByXml(req, res, err);
            } else {
                if (typeof msg != "string") {
                    for (var __temp in msg) {
                        msg[__temp].url = req.local_domain + '/mobileweb/' + req.bkey + msg[__temp].url;
                        // need change
                        msg[__temp].picUrl = req.resource_domain + msg[__temp].picUrl.replace('./','');
                    }
                }
                res.reply(msg);
            }

        });
     }).image(function(message, req, res, next){
		console.log(req.wxsession);
        res.reply("您多想了吧。。。");
    }).location(function(message, req, res, next){
        weixin.location.do(message, req, res);
    }).voice(function(message, req, res, next){
            res.reply("您多想了吧。。。");
    }).link(function(message, req, res, next){
            res.reply("您多想了吧。。。");
    }).event(function(message, req, res, next){
		console.log(req.wxsession);
            req.wxsession.text  =  "123";

            weixin.event.do(message, req, res, function(err, msg){
                if (!!err) {
                    return report.errResponseByXml(req, res, err);
                } else {
                    if (typeof msg != 'string') {
                        for (var __temp in msg) {
                            msg[__temp].url = req.local_domain + '/mobileweb/' + req.bkey + msg[__temp].url;
                            msg[__temp].picUrl = req.resource_domain + msg[__temp].picUrl.replace('./','');
                        }
                    }
                    res.reply(msg);
                }

            });
    }).middlewarify());


//    // development only
//    if ('development' == app.get('env')) {
//      app.use(express.errorHandler());
//    }


    var server = http.createServer(app);
    http.createServer(app).listen(80, function(){
        console.log('Express server listening on port 65001');
    });
/*
    server.close = function () {};
    var worker = require( 'pm').createWorker();
    graceful({
        server: server,
        worker: worker,
        error: function (err) {
            return report.errResponseByXml({body:undefined},undefined,{message:err.stack});
        },
        killTimeout: 1000
    });
    worker.ready(function(socket, which) {
        server.emit('connection', socket);
    });
*/
